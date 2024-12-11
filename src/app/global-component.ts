export const GlobalComponent = {

    // BASE_API:"https://rayalogistics.com.eg/RayaLogisticswmsAPI_Staging/api",
    // BASE_API:"https://rayalogistics.com.eg/RayaLogisticswmsAPI_Staging/api",
    BASE_API:"https://localhost:44310/api",
    Controllers: {
        SHIFT_ATTRIBUTE:{
            NAME:"ShiftsAttribute",
            API_ACTIONS: {
                GET_ALL:`GetAllShiftAttribute`,
                GET_BY_ID: "GetShiftAttribute",
                CREATE: "CreateshiftAttribute",
                EDIT: "EditshiftAttribute",
                CREATE_LIST: "CreateListOfShiftAttribute",
                GET_LOOKUP: "GetAllShiftAttributeLookup"
            }
        },
        HOLIDAY:{
            NAME:"Holiday",
            API_ACTIONS: {
                GET_ALL:`GetAllHoliday`,
                GET_BY_ID: "GetHoliday",
                CREATE: "CreateHoliday",
                EDIT: "EditHoliday",
            }
        },
        SHIFT_TYPE:{
            NAME:"ShiftsType",
            API_ACTIONS: {
                GET_ALL:`GetAllShiftType`,
                GET_BY_ID: "GetShiftType",
                CREATE: "CreateshiftsType",
                EDIT: "EditshiftsType",
            }
        },
        WAREHOUSE:{
            NAME:"Warehouse",
            API_ACTIONS: {
                GET_ALL:`get-all-Warehouse`,
                GET_ALL_WAREHOUSE:`GetAllWarehouse`,
                GET_BY_ID: "get-Warehouse-by-id",
                CREATE: "Create-Warehouse",
                EDIT: "edit-Warehouse",
                DELETE: "deleted-Warehouse",
                CREATE_LIST: "Create-list-warehouse",
                GET_ALL_WAREHOUSE_FOR_USER: "getAllWarehousesForUser",
                GET_ALL_WAREHOUSE_FOR_USER_ALL_DATA: "getAllWarehousesForUserAllData",
                GET_LOOKUP: "GetAllWarehouseLookup"
            }
        },
        ITEM:{
            NAME:"Item",
            API_ACTIONS: {
                GET_ALL:`GetAllItem`,
                GET_BY_ID: "GetItem",
                CREATE: "CreateItem",
                EDIT: "EditItem",
                DELETE: "DeleteItem",
                CREATE_LIST: "CreateListOfItem",
                GET_ALL_PAGINATION: "GetAllItemPagination",
                GET_ALL_ITEM_FOR_USER: "GetAllItemForUser",
                GET_ITEM_FOR_SPECIFIC_COMPANY:"GetItemForSpecificCompany",
                GET_LOOKUP: "GetAllItemLookup",
                GET_ITEM_BY_BARCODE_AND_COMPANY_WITH_ITEMDETAILS: "GetItemByBarCodeAndCompanyIdWithItemDetails",
            }
        },
        ITEM_DETAIL:{
            NAME:"ItemDetail",
            API_ACTIONS: {
                GET_ALL:`GetAllItem`,
                GET_BY_ID: "GetItem",
                CREATE: "CreateItemDetail",
                EDIT: "EditItemDetail",
                DELETE: "DeleteItem",
                CREATE_LIST: "CreateListOfItem",
                GET_ALL_PAGINATION: "GetAllItemPagination",
                GET_ALL_ITEM_FOR_USER: "GetAllItemForUser",
                GET_ITEM_FOR_SPECIFIC_COMPANY:"GetItemForSpecificCompany",
                GET_LOOKUP: "GetAllItemLookup"
            }
        },
        ITEM_STATUS:{
            NAME:"StockTypeDetails",
            API_ACTIONS:{
                GET_ALL:"GetAllItemStatus",
                GET_BY_ID: "GetItemStatus",
                CREATE: "CreateItemStatus",
                EDIT: "EditItemStatus",
                DELETE: "DeleteItemStatus",
                CREATE_LIST: "CreateListOfItemStatus",
                GET_ALL_PAGINATION: "GetAllItemStatusPagination",
                GET_LOOKUP: "GetAllItemStatusLookup"
            }
        },
        DOCK:{
            NAME:"Dock",
            API_ACTIONS:{
                GET_ALL:"GetAllDock",
                GET_BY_ID: "GetDock",
                CREATE: "CreateDock",
                EDIT: "EditDock",
                DELETE: "DeleteDock",
                CREATE_LIST: "CreateListOfDock",
                GET_ALL_PAGINATION: "GetAllDockPagination",
                GET_LOOKUP: "GetAllDockLookup",
                GET_LOOKUP_BASED_WAREHOUSE: "GetAllDockByWarehouseIdLookup"
            }
        },
        VENDOR:{
            NAME:"Vendor",
            API_ACTIONS:{
                GET_ALL:"GetAllVendor",
                GET_BY_ID: "GetVendor",
                CREATE: "CreateVendor",
                CREATE_VENDORS: "CreateVendors",
                EDIT: "EditVendor",
                DELETE: "DeleteVendor",
                CREATE_LIST: "CreateListOfVendor",
                GET_ALL_PAGINATION: "GetAllVendorPagination",
                GET_LOOKUP: "GetAllVendorLookup"
            }
        },
        TRANSACTION_TYPE:{
            NAME:"TransactionType",
            API_ACTIONS:{
                GET_ALL:"GetAllTransactionType",
                GET_BY_ID: "GetTransactionType",
                CREATE: "CreateTransactionType",
                EDIT: "EditTransactionType",
                DELETE: "DeleteTransactionType",
                CREATE_LIST: "CreateListOfTransactionType",
                GET_ALL_PAGINATION: "GetAllTransactionTypePagination",
                GET_LOOKUP: "GetAllTransactionTypeLookup"
            }
        },
        TRANSACTION_WAY:{
            NAME:"TransactionWay",
            API_ACTIONS:{
                GET_ALL:"GetAllTransactionWay",
                GET_BY_ID: "GetTransactionWay",
                CREATE: "CreateTransactionWay",
                EDIT: "EditTransactionWay",
                DELETE: "DeleteTransactionWay",
                CREATE_LIST: "CreateListOfTransactionWay",
                GET_ALL_PAGINATION: "GetAllDockPagination",
                GET_LOOKUP: "GetAllTransactionWayLookup"
            }
        },
        TRUCK_TYPE:{
            NAME:"TruckType",
            API_ACTIONS:{
                GET_ALL:"GetAllTruckType",
                GET_BY_ID: "GetTruckType",
                CREATE: "CreateTruckType",
                EDIT: "EditTruckType",
                DELETE: "DeleteTruckType",
                CREATE_LIST: "CreateListOfTruckType",
                GET_ALL_PAGINATION: "GetAllTruckTypePagination",
                GET_LOOKUP: "GetAllTruckTypeLookup"
            }
        },
        PALLET_CATEGORY:{
            NAME:"PalletCategory",
            API_ACTIONS:{
                GET_ALL:"GetAllPalletCategory",
                GET_BY_ID: "GetPalletCategory",
                CREATE: "CreatePalletCategory",
                EDIT: "EditPalletCategory",
                DELETE: "DeletePalletCategory",
                CREATE_LIST: "CreateListOfPalletCategory",
                GET_ALL_PAGINATION: "GetAllPalletCategoryPagination",
                GET_LOOKUP: "Gget-all-palletCategory_lookups"
            }
        },
        WAREHOUSE_QUEUE:{
            NAME:"WhQueue",
            API_ACTIONS:{
                GET_ALL:"GetAllWhQueue",
                GET_BY_ID: "GetWhQueue",
                GET_BY_ID_WITH_INCLUDING: "GetWhQueueWithIncluding",
                GET_BY_BARCODE: "GetWhQueueByBarCode",
                CREATE: "CreateWhQueue",
                EDIT: "EditWhQueue",
                DELETE: "DeleteTruckType",
                CREATE_LIST: "CreateListOfWhQueue",
                GET_ALL_PAGINATION: "GetAllTruckTypePagination",
                GET_LOOKUP: "GetAllTruckTypeLookup"
            }
        },
        BRAND:{
            NAME:"Brand",
            API_ACTIONS:{
                GET_ALL:"GetAllBrand",
                GET_BY_ID: "GetBrand",
                CREATE: "CreateBrand",
                EDIT: "EditBrand",
                DELETE: "DeleteBrand",
                CREATE_LIST: "CreateListOfBrand",
                GET_ALL_PAGINATION: "GetAllBrandPagination",
                GET_LOOKUP: "GetAllBrandLookup"
            }
        },
        CATEGORY:{
            NAME:"Category",
            API_ACTIONS:{
                GET_ALL:"GetAllCategory",
                GET_BY_ID: "GetCategory",
                CREATE: "CreateCategory",
                EDIT: "EditCategory",
                DELETE: "DeleteCategory",
                CREATE_LIST: "CreateListOfCategory",
                GET_ALL_PAGINATION: "GetAllCategoryPagination",
                GET_LOOKUP: "GetAllCategoryLookup"
            }
        },
        SERIAL_DEFINITIONS:{
            NAME:"SerialDefinations",
            API_ACTIONS:{
                GET_ALL:"GetAllCategory",
                GET_BY_ID: "GetCategory",
                GET_BY_SERIAL: "GetSerial",
                GET_BY_ITEM_ID: "GetSerialByItemId",
                CREATE: "CreateCategory",
                EDIT: "EditCategory",
                DELETE: "DeleteCategory",
                CREATE_LIST: "CreateListOfCategory",
                GET_ALL_PAGINATION: "GetAllCategoryPagination",
                GET_LOOKUP: "GetAllCategoryLookup"
            }
        }
        ,
        MASTER_UNIT:{
            NAME:"MasterUnit",
            API_ACTIONS:{
                GET_ALL:"GetAllMasterUnit",
                GET_BY_ID: "GetMasterUnit",
                CREATE: "CreateMasterUnit",
                EDIT: "EditMasterUnit",
                DELETE: "DeleteMasterUnit",
                CREATE_LIST: "CreateListOfMasterUnit",
                GET_ALL_PAGINATION: "GetAllMasterUnitPagination",
                GET_LOOKUP: "GetAllMasterUnitLookup"
            }
        }
    },


    // Api Calling
    API_URL : 'https://api-node.themesbrand.website/',
    // API_URL : 'http://127.0.0.1:3000/',
    headerToken : {'Authorization': `Bearer ${localStorage.getItem('token')}`},

    // Auth Api
    AUTH_API:"https://api-node.themesbrand.website/auth/",
    // AUTH_API:"http://127.0.0.1:3000/auth/",

    BASE_LOCAL_API:"https://localhost:44310//api",
    
    // Products Api
    product:'apps/product',
    productDelete:'apps/product/',

    // Orders Api
    order:'apps/order',
    orderId:'apps/order/',

    // Customers Api
    customer:'apps/customer',
}