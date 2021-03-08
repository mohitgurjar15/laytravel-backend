export class FlightBookingEmailParameterModel {
    user_name: string;
    flight: flightData[];
    orderId: string;
    bookingType: number;
    cart: cart;
    traveler:traveler[]
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
    cartId : string
    totalAmount: string;
    totalPaid?: string;
    rememberAmount?: string;
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
    pnr_no:string;
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