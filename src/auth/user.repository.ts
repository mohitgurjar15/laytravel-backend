import { Repository, EntityRepository } from "typeorm";
import { User } from "../entity/user.entity";
import {  BadRequestException, NotFoundException, NotAcceptableException, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { UpdateUserDto } from "src/user/dto/update-user.dto";
import { ChangePasswordDto } from "src/user/dto/change-password.dto";
import { ListUserDto } from "src/user/dto/list-user.dto";
import * as bcrypt from 'bcrypt';
import { errorMessage } from "src/config/common.config";

@EntityRepository(User)
export class UserRepository extends Repository<User>
{
    hashPassword(password: string, salt: string): Promise<string> {
        return bcrypt.hash(password, salt)
    }

    async updateUser(updateUserDto: UpdateUserDto, userId: string){
        const { firstName,
            middleName,
            lastName
            } = updateUserDto;
        const userData = await this.findOne({
            where: { userId, isDeleted: 0 }
        });

        userData.firstName = firstName;
        userData.middleName = middleName || '';
        userData.lastName = lastName;       
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
            user.updatedBy = user;

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


    async listUser(paginationOption: ListUserDto): Promise<{ data: User[], TotalReseult: number }> {
        const { page_no, search, limit } = paginationOption;

        const take = limit || 10
        const skip = (page_no-1) * limit || 0
        const keyword = search || ''

        let where;
        if(keyword){
             where =`("is_deleted"=false) and ("first_name" ILIKE '%${keyword}%') or ("middle_name" ILIKE '%${keyword}%') or ("last_name" ILIKE '%${keyword}%') or ("email" ILIKE '%${keyword}%')`
        }
        else{
             where = ` ("is_deleted"=false) and 1=1`
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
}