import { CancellationPolicy } from "./room_details.model";

export class VerifyAvailability {
    property_name: string;
    property_id: number;
    room_id: number;
    rate_plan_code: string;
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