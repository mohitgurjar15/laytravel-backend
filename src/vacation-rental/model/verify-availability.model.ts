import { CancellationPolicy } from "./room_details.model";

export class VerifyAvailability {
    property_name: string;
    property_id: number;
    room_id: number;
    rate_plan_code: string;
    room_name:string;
    available_status: boolean;
    booking_code: string;
    net_price: number;
    selling_price: number;
    start_price: number;
    secondary_start_price: number;
    secondary_selling_price: number;
    instalment_details: {};
    cancellation_policy: CancellationPolicy;
    feesType: FeesType;
    city: string;
    country: string;
    adult: number;
    number_and_chidren_age: any = [];
}

export class FeesType {
    mandtory_fee_already_paid: Fees[] = [];
    mandtory_fee_due_at_check_in: Fees[] = [];
    optional_fee: Fees[] = [];
}

export class Fees {
    message: string;
}

// [{"number_and_chidren_age":[10],"property_name":"UMA SUITES RAMBLA CATALUNYA","property_id":42945378123775,"room_id":42945378058257,"rate_plan_code":"ElevnLettrs","available_status":true,"booking_code":"412aee413c7d495884d8626db4bebf709fa25676ee275c4023842e3291e7ea49","net_price":121.57,"selling_price":149.53,"start_price":0,"secondary_start_price":0,"secondary_selling_price":0,"instalment_details":{"instalment_available":false,"instalment_date":[],"percentage":0},"feesType":{"mandtory_fee_already_paid":[{"message":"Local tax (18+)"},{"message":"Laundry (bed linen and towels)"},{"message":"Final cleaning"}],"mandtory_fee_due_at_check_in":[],"optional_fee":[{"message":"Pet (max. 1 pet)"},{"message":"Laundry (initial supply of bed linen and towels)"},{"message":"Cot (up to 2 years)"}]},"cancellation_policy":{"is_refundable":true,"penalty_info":["149.53 cancellation fee 0 Days BeforeArrival","119.62400000000001 cancellation fee 1 Days BeforeArrival","74.765 cancellation fee 28 Days BeforeArrival","14.953000000000001 cancellation fee 42 Days BeforeArrival"]},"city":"Barcelona","country":"Spain","adult":1}]