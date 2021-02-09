import { User } from "src/entity/user.entity";
import { getManager } from "typeorm";

export class UserHelper{
	
	async getUser(id: string) {
		let user = await getManager().createQueryBuilder(User, "user")
			.leftJoinAndSelect("user.country", "countries")
			.select([
				"user.userId",
				"user.title",
				"user.firstName",
				"user.lastName",
				"user.email",
				"user.countryCode",
				"user.phoneNo",
				"user.zipCode",
				"user.gender",
				"user.dob",
				"user.passportNumber",
				"user.passportExpiry",
				"countries.name",
				"countries.iso2",
				"countries.iso3",
				"countries.id",
			])
			.where('"user"."user_id" IN (:id)', { id })
			.getOne();
		
		return user;
	}

	async getUsers(user_ids: string[]) {

		let users = await getManager().createQueryBuilder(User, "user")
			.leftJoinAndSelect("user.country", "countries")
			.select([
				"user.userId",
				"user.title",
				"user.firstName",
				"user.lastName",
				"user.email",
				"user.countryCode",
				"user.phoneNo",
				"user.zipCode",
				"user.gender",
				"user.dob",
				"user.passportNumber",
				"user.passportExpiry",
				"countries.name",
				"countries.iso2",
				"countries.iso3",
				"countries.id",
			])
			.where('"user"."user_id" IN (:...user_ids)', { user_ids })
            .getMany();
        
		return users;
		
	}
}