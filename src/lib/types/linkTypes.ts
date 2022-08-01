export interface Link {
  label: string;
  slug: string | null;
  url: string | null;
  toolTip: string | null;
  disabled: boolean;
}
export interface LinkList {
  heading: string;
  linkList: Link[];
}