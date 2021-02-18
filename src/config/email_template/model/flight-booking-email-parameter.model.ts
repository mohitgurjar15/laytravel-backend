export class FlightBookingEmailParameterModel {
    user_name: string;
    flightData: flightData[];
    orderId: string;
    paymentDetail: paymentDetail
    travelers: traveler[];
    bookingType: number;
    cart: cart;
    bookingStatus:string;
    // pnr_no: string;
}

class flightData {
    rout: string;
    status: string;
    droups: droups[];
}

class droups {
    airline: string;
    flight: string;
    depature: depature;
    arrival: arrival;
}

class cart {
    cartId: string;
    totalAmount: string;
    totalPaid?: string;
    rememberAmount?: string;
}

class paymentDetail {
    amount: string;
    date: string;
    status: string;
}

class traveler {
    name: string;
    email: string;
    type: string
}

class depature {
    code: string;
    name: string;
    city: string;
    country: string;
    date: string;
    flight: string;
    time: string;
}

class arrival {
    code: string;
    name: string;
    city: string;
    country: string;
    date: string;
    flight: string;
    time: string;
}