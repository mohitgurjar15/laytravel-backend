export class HomeRentalBookingParameterModel{
    user_name: string;
    hotelData: hotelData;
    orderId: string;
    paymentDetail: paymentDetail[]
    travelers: traveler[];
}

export class hotelData{
    property_name:string;
    city:string;
    country:string;
    check_in_date:string;
    check_out_date:string;
    cancellation_policy:string;
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