import { Responseheader } from "./responseheader";

export interface Loginresponseviewmodel {
    success:boolean;
    message: string;
    arabicMessage: string,
    statusCode:number,
    returnObject: any
}