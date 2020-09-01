import { EntityRepository, Repository, getManager} from "typeorm";
import { Booking } from "src/entity/booking.entity";


@EntityRepository(Booking)
export class BookingRepository extends Repository<Booking> {

    async listBooking(){}

    async getBookingDetails(bookingId){
        let bookingDetails =   await getManager()
        .createQueryBuilder(Booking,"booking")
        .leftJoinAndSelect("booking.bookingInstalments","bookingInstalments")
        .leftJoinAndSelect("booking.currency2","currency")
        .leftJoinAndSelect("booking.user","User")
        /* .select([
            "user.userId","user.title",
            "user.firstName","user.lastName","user.email",
            "user.countryCode","user.phoneNo","user.zipCode",
            "user.gender","user.dob","user.passportNumber",
            "user.passportExpiry",
            "countries.name","countries.iso2","countries.iso3","countries.id",
        ]) */
        .where('"booking"."id"=:bookingId',{ bookingId})
        .getMany();
        
        
        if(bookingDetails){
            return bookingDetails
        }
        return false;
     }
}
