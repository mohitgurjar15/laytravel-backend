export class HomeRentalBookingParameterModel{
    user_name: string;
    hotelData: hotelData;
    booking_status :string;
    orderId: string;
    paymentDetail: paymentDetail[]
    travelers: traveler[];
}

export class hotelData{
    property_name:string;
    room_name:string;
    city:string;
    country:string;
    check_in_date:string;
    check_out_date:string;
    cancellation_policy:CancellationPolicy;
}

class traveler {
    name: string;
    email: string;
    type: string
}

class paymentDetail {
    amount: string;
    date: string;
    status: string;
}

export class CancellationPolicy{
    is_refundable:boolean;
    penalty_info:[]
}