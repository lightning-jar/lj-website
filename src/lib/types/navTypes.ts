export interface NavMenuItem {
  label: string;
  slug: string | null;
  url: string | null;
};
export interface NavDataItem {
  label: string;
  type: string;
  items: NavMenuItem[] | null;
  slug: string | null;
}
export type Flyout = HTMLElement;