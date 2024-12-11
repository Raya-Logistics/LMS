import { MenuItem } from "./menu.model";

export const MENU: MenuItem[] = [
  {
    id: 1,
    label: "Transactions",
    isTitle: true,
  },
  {
    id: 2,
    label: "Transactions",
    icon: "ri-arrow-left-right-fill",
    isCollapsed: true,
    subItems: [
      {
        id: 4,
        label: "Shift",
        link: "/shift",
        parentId: 2,
      },
      {
        id: 10,
        label: "Warehouse Queue",
        link: "/warehouseQueue",
        parentId: 8,
      },
      {
        id: 10,
        label: "Handling Scanner",
        link: "/handlingScanner",
        parentId: 8,
      },
      {
        id: 10,
        label: "Handling IN",
        link: "/handlingIn",
        parentId: 8,
      },
      {
        id: 10,
        label: "Handling Out",
        link: "/handlingOut",
        parentId: 8,
      }
    ]
    }
,
  {
    id: 1,
    label: "Tracking",
    isTitle: true,
  },
  {
    id: 2,
    label: "Tracking",
    icon: "ri-settings-2-line",
    isCollapsed: true,
    subItems: [
      {
        id: 1,
        label: "Operation Manager",
        link: "/operationManger",
      },
    ],
  },
  {
    id: 1,
    label: "Configurations",
    isTitle: true,
  },
  {
    id: 2,
    label: "Configurations",
    icon: "ri-survey-fill",
    isCollapsed: true,
    subItems: [
      {
        id: 1,
        label: "User",
        icon: "ri-user-line",
        link: "/userConfiguration",
      },
      {
        id: 1,
        label: "Warehouse",
        icon: "ri-user-line",
        link: "/warehouseConfiguration",
      },
      {
        id: 1,
        label: "Company",
        icon: "ri-user-line",
        link: "/companyConfiguration",
      },
      {
        id: 1,
        label: "Shift",
        icon: "ri-user-line",
        link: "/allShiftConfiguration",
      },
      {
        id: 1,
        label: "Master Data",
        icon: "ri-user-line",
        link: "/masterDataConfiguration",
      },{
        id: 1,
        label: "Truck Type",
        icon: "ri-user-line",
        link: "/truckType",
      }
      
    ],
  },
  {
    id: 1,
    label: "Reports",
    isTitle: true,
  },
  {
    id: 2,
    label: "Reports",
    icon: "ri-survey-fill",
    isCollapsed: true,
    subItems: [
      {
        id: 2,
        label: "Super Admin",
        icon: "ri-admin-line",
        isCollapsed: true,
        subItems: [
          {
            id: 10,
            label: "Transactions Summery",
            link: "/transactionSummery",
            parentId: 8,
          },{
            id: 10,
            label: "Stock",
            link: "/stock",
            parentId: 8,
          },
        ],
      },
    ],
  },
];
