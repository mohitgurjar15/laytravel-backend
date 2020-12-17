export class VerifyAvailability {
    available_status: boolean;
    booking_code: string;
    net_price: number;
    selling_price: number;
    start_price: number;
    secondary_start_price: number;
    secondary_selling_price: number;
    instalment_details: {};
    feesType:FeesType;
}

export class FeesType{
    mandtory_fee_already_paid:Fees[] =[];
    mandtory_fee_due_at_check_in:Fees[] =[];
    optiona_fee:Fees[] =[];
}

export class Fees{
    message:string;
}