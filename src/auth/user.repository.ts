import { Repository, EntityRepository, In } from "typeorm";
import { User } from "../entity/user.entity";
import {  BadRequestException, NotFoundException, NotAcceptableException, InternalServerErrorException, UnauthorizedException, ConflictException } from "@nestjs/common";
import { UpdateUserDto } from "src/user/dto/update-user.dto";
import { ChangePasswordDto } from "src/user/dto/change-password.dto";
import { ListUserDto } from "src/user/dto/list-user.dto";
import * as bcrypt from 'bcrypt';
import { errorMessage } from "src/config/common.config";
import { SaveUserDto } from "src/user/dto/save-user.dto";
import { v4 as uuidv4 } from "uuid";
import { MailerService } from "@nestjs-modules/mailer";
import { ProfilePicDto } from "./dto/profile-pic.dto";

@EntityRepository(User)
export class UserRepository extends Repository<User>
{
    
    hashPassword(password: string, salt: string): Promise<string> {
        return bcrypt.hash(password, salt)
    }

    async updateUser(updateUserDto: UpdateUserDto,files:ProfilePicDto, userId: string , roleId:number[]){
        const { firstName,
            middleName,
            lastName,
            profile_pic
            } = updateUserDto;
        const userData = await this.findOne({
            where: { userId, isDeleted: 0 ,roleId: In(roleId)}
        });
        
        if(!userData)
        {
            throw new NotFoundException(`No user Found.&&&id`);
        }
        userData.firstName = firstName;
        userData.middleName = middleName || '';
        userData.lastName = lastName;
        if(typeof files.profile_pic!='undefined')
        userData.profilePic=files.profile_pic[0].filename;       
        userData.updatedDate = new Date();
        /* userData.gender = gender;
        userData.country = country;
        userData.state = state;
        userData.city = city;
        userData.address = address
        userData.zipCode = zipCode */
        try {
            await userData.save();
            return userData;
        }
        catch (error) {
            throw new InternalServerErrorException(`${error.message}&&&no_key&&&${errorMessage}`)
        }
    }

    async changePassword(changePasswordDto: ChangePasswordDto, userId: string) {
        const { old_password,password } = changePasswordDto;

        const user = await this.findOne({
            where: { userId: userId, isDeleted: 0 }
        });

        if (await user.validatePassword(old_password)) {
            const salt = await bcrypt.genSalt();
            user.salt = salt;
            user.password = await this.hashPassword(password, salt);
            user.updatedDate = new Date();
            user.updatedBy = user.userId;

        }
        else {
            throw new BadRequestException(`Your old password doesn't match.&&&old_pasword`)
        }

        try {
             await user.save();
             return { message : `Your password is updated successfully.`}
        }
        catch (error) {
            throw new InternalServerErrorException(error.sqlMessage);
        }
    }

    /**
     * list user using own role id and the pagination option 
     * @param paginationOption 
     * @param role 
     */
    async listUser(paginationOption: ListUserDto,role:number[]): Promise<{ data: User[], TotalReseult: number }> {
        const { page_no, search, limit } = paginationOption;

        const take = limit || 10
        const skip = (page_no-1) * limit || 0
        const keyword = search || ''
        
        let where;
        if(keyword){
             where =`("role_id" IN (${role}) and ("is_deleted"=false) and ("first_name" ILIKE '%${keyword}%') or ("middle_name" ILIKE '%${keyword}%') or ("last_name" ILIKE '%${keyword}%') or ("email" ILIKE '%${keyword}%')`
        }
        else{
             where = `("role_id" IN (${role}) ) and ("is_deleted"=false) and 1=1`
        }
        const [result, total] = await this.findAndCount({
            where : where,
            skip: skip,
            take: take,
        });
        if (!result || total <= skip) {
            throw new NotFoundException(`No user found.`)
        }
        return { data: result, TotalReseult: total };
    }

    
    async createUser(saveUserDto: SaveUserDto,roleId:number,files: ProfilePicDto): Promise<User> {
        const {
            email,
            password,
            first_name,
            last_name,
            } = saveUserDto;

        const salt = await bcrypt.genSalt();
        const user = new User();
        user.userId = uuidv4();
        user.accountType=1;
        user.socialAccountId="";
        user.phoneNo="";
        if(typeof files.profile_pic!='undefined')
        user.profilePic=files.profile_pic[0].filename;
        user.timezone="";
        user.status=1;
        user.roleId=roleId;
        user.email = email;
        user.firstName = first_name;
        user.middleName="";
        user.zipCode="";
        user.lastName = last_name;
        user.salt = salt;
        user.createdDate = new Date();
        user.updatedDate = new Date();
        user.password = await this.hashPassword(password, salt);

        const userExist = await this.findOne({
            email
        })

        if(userExist){
            throw new ConflictException(`This email address is already registered with us. Please enter different email address .`);
        }
        else{
            await user.save();
            return user;
        }
    }


    /**
     * export user
     * @param roleId 
     */
    async exportUser(
		roleId:number[]
	): Promise<{ data: User[]}> {
		try {
			const userData = await this.find({
				where: {isDeleted: 0 ,roleId: In(roleId)}
			});
			if (!userData) {
				throw new NotFoundException(`No user found.`)
			}
			return { data: userData };
		} catch (error) {
			if (
				typeof error.response !== "undefined" &&
				error.response.statusCode == 404
			) {
				throw new NotFoundException(`No user Found.&&&id`);
			}

			throw new InternalServerErrorException(
				`${error.message}&&&id&&&${errorMessage}`
			);
		}
	}
}