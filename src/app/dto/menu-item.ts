export interface MenuItem {
  route?: string;
  label: string;
  icon: string;
  roles?: string[];
  children?: MenuItem[];
}
