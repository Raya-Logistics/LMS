export interface CreateShiftTransactionCommand {
    shiftHeader: {
        shiftStartingDate: Date;
        shiftEndDate: Date;
        shiftShiftTypeId: number;
        shiftComment: string;
        shiftRequestBy: string;
        shiftRequestsEvedance: any;
        shiftCompanyId?: number;
        shiftCustomerId?: number;
        shiftIsactive: boolean;
      };
      shiftDetails: Array<{
        shiftDetailsHeaderId: number;
        shiftDetailsAttributeId: number;
        shiftDetailsValue: number;
        shiftDetailsIsActive: boolean;
        shiftDetailsComment: string;
        shitDetailsSellingRate?: number;
        shiftDetailsTotalAmout?: number;
      }>;
}
