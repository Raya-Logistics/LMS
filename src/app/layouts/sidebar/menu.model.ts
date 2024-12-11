export interface MenuItem {
  id?: number;
  label?: any;
  icon?: string;
  isCollapsed?: boolean;
  link?: string;
  subItems?: any;
  isTitle?: boolean;
  badge?: any;
  parentId?: number;
  isLayout?: boolean;
}