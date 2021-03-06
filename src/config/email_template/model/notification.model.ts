export class EmailNotificationModel {
    flightRoute: string;
    routeType: string;
    depatureDate: string;
    remainDays: number;
    reservationDeadline: string;
    sellingPrice: string;
    currencySymbol: string;
    netRate: string;
    todayNetPrice: string;
    totalRecivedFromCustomer: number;
    totalRecivedFromCustomerPercentage: number;
    laytripBookingId: string;
    todayNetpriceVarient ?: number
    lastPrice ?: number
    alredyUnderDeadLine ?: boolean
}
