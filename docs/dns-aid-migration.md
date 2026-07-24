# DNS-AID Implementation Runbook

Status: **pending** (drafted 2026-07-24; execution requires DreamHost +
Cloudflare + DigitalOcean dashboard access — not a repo change).

Goal: publish DNS for AI Discovery (DNS-AID) records so agents can
discover this site's endpoints via DNS, per
[draft-mozleywilliams-dnsop-dnsaid](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/)
and [RFC 9460](https://www.rfc-editor.org/rfc/rfc9460) (SVCB/HTTPS
records). This is the last open finding from the isitagentready.com
audit — everything else (llms.txt, MCP + server card, api-catalog, Link
headers, Content-Signals, markdown negotiation, agent-skills index,
WebMCP) shipped in July 2026.

## Why this requires a DNS move

State as of 2026-07-24:

- Registrar: **DreamHost**
- DNS hosting: **DigitalOcean** (`ns1/2/3.digitalocean.com`)
- DNSSEC: **not signed** (no DS record at the registry)

DigitalOcean DNS supports neither the SVCB/HTTPS record type nor
DNSSEC signing — both required by DNS-AID. The records cannot be added
where the zone lives today. Plan: move DNS hosting to **Cloudflare
(free tier)** — native HTTPS/SVCB records, one-click DNSSEC. The
registrar stays DreamHost; only nameservers + one DS record change
there.

## Step 1 — Recreate the zone at Cloudflare

Add `lightningjar.com` to a free Cloudflare account and recreate the
zone. Records confirmed by DNS probing on 2026-07-24 — **cross-check
against the DigitalOcean control panel before the switch**, especially
the full DKIM value (truncated in probes), and export/screenshot the DO
zone for rollback:

| Type  | Name                | Value                                            | Note |
|-------|---------------------|--------------------------------------------------|------|
| A     | `@`                 | `216.150.1.1`                                    | Vercel apex — **DNS only** (grey cloud) |
| CNAME | `www`               | `e961a0776b393601.vercel-dns-016.com`            | **DNS only** — Vercel must terminate TLS |
| MX    | `@`                 | `1 aspmx.l.google.com`                           | Google Workspace |
| MX    | `@`                 | `5 alt1.aspmx.l.google.com`                      | |
| MX    | `@`                 | `5 alt2.aspmx.l.google.com`                      | |
| MX    | `@`                 | `10 alt3.aspmx.l.google.com`                     | |
| MX    | `@`                 | `10 alt4.aspmx.l.google.com`                     | |
| TXT   | `@`                 | `v=spf1 include:_spf.google.com ~all`            | SPF |
| TXT   | `_dmarc`            | `v=DMARC1; p=reject;`                            | DMARC |
| TXT   | `google._domainkey` | *(copy full value from DO panel)*                | DKIM |
| TXT   | `_github-challenge-lightning-jar-org` | `f7277f7918`                   | GitHub org domain verification (one-time check, already passed; carried over so re-verification never becomes a chore) |

⚠️ The one real footgun: the two Vercel records must be **DNS only**
(grey cloud). Proxied (orange-cloud) records would put Cloudflare in
front of Vercel and break TLS/edge behavior.

## Step 2 — Flip nameservers at DreamHost

In the DreamHost panel, replace `ns1/2/3.digitalocean.com` with the two
nameservers Cloudflare assigns. Afterward:

- verify https://www.lightningjar.com and https://lightningjar.com load;
- **send a test email** to kevin@lightningjar.com (mail is what hurts
  if a record was missed).

Keep the DO zone intact until confirmed — rollback is then just
flipping nameservers back.

## Step 3 — Enable DNSSEC

1. Cloudflare: DNS → Settings → **Enable DNSSEC** → it produces a DS
   record.
2. Add that DS record at DreamHost.
   - **Verify first** that DreamHost's panel accepts a DS record for a
     domain on third-party DNS. If it does not, options are: transfer
     the registration to a registrar that does (e.g. Cloudflare
     Registrar), or ship without DNSSEC — the scanner's primary check
     is record presence; DNSSEC is the authentication half.

## Step 4 — The DNS-AID records (the goal)

Add two **HTTPS** records at Cloudflare, both **DNS only**:

```
_index._agents.lightningjar.com.  3600  IN  HTTPS  1  www.lightningjar.com.  alpn="h2" port=443
_mcp._agents.lightningjar.com.    3600  IN  HTTPS  1  www.lightningjar.com.  alpn="h2" port=443
```

Cloudflare UI mapping: type `HTTPS`, name `_index._agents` (and
`_mcp._agents`), priority `1` (ServiceMode), target
`www.lightningjar.com`, SvcParams `alpn="h2" port=443`.

Rationale: `_index` is the label the draft formally defines (the
discovery entrypoint — for this site, the host serving `/llms.txt`,
`/.well-known/mcp.json`, and `/.well-known/api-catalog`); `_mcp`
advertises the MCP endpoint specifically. `_a2a` is skipped — no A2A
endpoint exists to advertise.

## Verification

```sh
dig HTTPS _index._agents.lightningjar.com +short   # should return the record
dig HTTPS _mcp._agents.lightningjar.com +short
dig lightningjar.com +dnssec                        # 'ad' flag once DS is live
```

Or via DNS-over-HTTPS (what the isitagentready scanner uses):

```sh
curl -s "https://cloudflare-dns.com/dns-query?name=_index._agents.lightningjar.com&type=HTTPS" \
  -H "accept: application/dns-json"
```

Then re-run the scan at https://isitagentready.com and check
`checks.discoverability.dnsAid.status` is `pass`.

## Lighter alternative (if the zone shouldn't move)

Delegate only `_agents.lightningjar.com` to a free DNSSEC-capable host
(e.g. deSEC) via NS records at DigitalOcean (DO does support NS
records) and publish the two HTTPS records there. Caveat: DO cannot
publish the DS record the delegation needs, so the DNSSEC chain stays
unauthenticated — likely still satisfies the scanner's
record-presence check, but not the authenticated-data requirement.
Full migration is the clean path; the zone is small enough to be a
~30-minute job.
