import { combineStatus } from "src/enum/booking-new-status.enum";
import { BookingStatus } from "src/enum/booking-status.enum";
import { PaymentStatus } from "src/enum/payment-status.enum";

export class BookingStatusUtility {
    static async bookingStatus(
        bookingStatus: BookingStatus,
        paymentStatus: PaymentStatus,
        checkoutDate: Date,
        flightChanged: boolean = false,
        onTrack: boolean = true
    ) {
        let status = 0;

        if (onTrack == true && bookingStatus == BookingStatus.PENDING) {
            status = combineStatus.Current;
        }

        if (bookingStatus == BookingStatus.CONFIRM) {
            status = combineStatus.Reserved;
        }

        if (paymentStatus == PaymentStatus.CONFIRM) {
            status = combineStatus.FullyPaid;
        }

        if (
            bookingStatus == BookingStatus.NOTCOMPLETED ||
            bookingStatus == BookingStatus.CANCELLED
        ) {
            status = combineStatus.Cancelled;
        }

        if (flightChanged == true) {
            status = combineStatus.FlightChange;
        }

        if (checkoutDate < new Date()) {
            status = combineStatus.Completed;
        }

        if (bookingStatus == BookingStatus.FAILED) {
            status = combineStatus.Suspended;
        }

        return status;
    }

    static async filterCondition(status, bookingAliasName) {
        if (typeof status != "number") {
            status = parseInt(status);
        }
        switch (status) {
            case combineStatus.Current:
                return `"${bookingAliasName}"."booking_status" = ${BookingStatus.PENDING}`;
                break;
            case combineStatus.Reserved:
                return `"${bookingAliasName}"."booking_status" = ${BookingStatus.CONFIRM}`;
                break;
            case combineStatus.Suspended:
                return `"${bookingAliasName}"."booking_status" = ${BookingStatus.FAILED}`;
                break;
            case combineStatus.FullyPaid:
                return `"${bookingAliasName}"."payment_status" = ${PaymentStatus.CONFIRM}`;
                break;
            case combineStatus.Cancelled:
                return `"${bookingAliasName}"."booking_status" IN (${BookingStatus.NOTCOMPLETED},${BookingStatus.CANCELLED})`;
                break;
            case combineStatus.FlightChange:
                return `"${bookingAliasName}"."is_resedule" = true`;
                break;

            case combineStatus.Completed:
                const date = new Date();
                var date1 = date.toISOString();
                date1 = date1
                    .replace(/T/, " ") // replace T with a space
                    .replace(/\..+/, "")
                    .split(" ")[0];
                return `"${bookingAliasName}"."check_out_date" < date('${date1}')`;
                break;

            default:
                return "";
                break;
        }
    }
}
