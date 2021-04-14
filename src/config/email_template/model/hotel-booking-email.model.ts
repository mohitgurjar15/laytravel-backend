export class HotelBookingEmailParameterModel {
    user_name: string;
    hotelData: hotelData;
    orderId: string;
    bookingType: number;
    cart: cart;
    traveler: traveler[];
    // pnr_no: string;
}

class hotelData {
    hotelName: string;
    checkIn: string;
    room: number;
    adult: number;
    child: number;
}

class cart {
    cartId: string;
    totalAmount: string;
    totalPaid?: string;
    rememberAmount?: string;
}

class traveler {
    name: string;
    email: string;
    type: string;
}
