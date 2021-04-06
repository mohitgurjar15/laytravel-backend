export class CartBookingEmailParameterModel {
    user_name: string;
    bookings: bookings[];
    orderId: string;
    paymentDetail: paymentDetail[]
    bookingType: number;
    cart: cart;
    // pnr_no: string;
}

class bookings {
    moduleId: number;
    productId: string;
    flighData?: flightData[];
    travelers: traveler[];
    hotelData?: hotelData;
}
class hotelData {
    hotelName: string;
    checkIn: string;
    room: number;
    adult: number;
    child:number
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
    pnr_no?:string
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