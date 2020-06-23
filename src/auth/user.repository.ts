import { Repository, EntityRepository, QueryBuilder, Like, Timestamp } from "typeorm";
import { User } from "../entity/user.entity";
import { ConflictException, BadRequestException, UnprocessableEntityException, NotFoundException, NotAcceptableException, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { UpdateUserDto } from "src/user/dto/update-user.dto";
import { ChangePasswordDto } from "src/user/dto/change-password.dto";
import { ListUserDto } from "src/user/dto/list-user.dto";
import { OrderByEnum } from "src/user/orderby.enum";
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from "./dto/crete-user.dto";


@EntityRepository(User)
export class UserRepository extends Repository<User>
{
    async saveUser(createUserDto: CreateUserDto): Promise<User> {
        const {
            email,
            password,
            firstName,
            lastName,
            middleName,
            } = createUserDto;

        const salt = await bcrypt.genSalt();
        const user = new User();
        console.table(user)
        user.email = email;
        user.firstName = firstName;
        user.middleName = middleName || '';
        user.lastName = lastName;
        user.salt = salt;
        user.createdDate = new Date();
        user.updatedDate = new Date();
        user.password = await this.hashPassword(password, salt);
        try {
            await user.save();
        } catch (error) {
            if (error.code == 'ER_DUP_ENTRY') {
                throw new ConflictException('Email Id Used');
            }
            else {
                throw new InternalServerErrorException(error.sqlMessage);
            }
        }

        delete user.password;
        delete user.salt;
        return user;
    }

    hashPassword(password: string, salt: string): Promise<string> {
        return bcrypt.hash(password, salt)
    }

    async updateProfile(updateUserDto: UpdateUserDto, userId: string): Promise<void> {
        const { firstName,
            middleName,
            lastName,
            email,
            profilePic,
            gender,
            country,
            state,
            city,
            address,
            zipCode  } = updateUserDto;
        const userData = await this.findOne({
            where: { user_id: userId, isDeleted: 0 }
        });

        console.table(userData)
        userData.email = email;
        userData.firstName = firstName;
        userData.middleName = middleName || '';
        userData.lastName = lastName;        
        userData.createdDate = new Date();
        userData.updatedDate = new Date();
        userData.profilePic = profilePic;
        /* userData.gender = gender;
        userData.country = country;
        userData.state = state;
        userData.city = city;
        userData.address = address
        userData.zipCode = zipCode */
        try {
            await userData.save();
        }
        catch (error) {
            throw new UnprocessableEntityException('Error while Update the User')
        }
    }

    async changePassword(changePasswordDto: ChangePasswordDto, userId: string) {
        const { oldPassword, newPassword } = changePasswordDto;

        const user = await this.findOne({
            where: { user_id: userId, isDeleted: 0 }
        });

        if (await user.validatePassword(oldPassword)) {
            const salt = await bcrypt.genSalt();
            user.salt = salt;
            user.password = await this.hashPassword(newPassword, salt);
            user.updatedDate = new Date();
            user.updatedBy = user;

        }
        else {
            throw new UnauthorizedException('Given Old Password Is Wrong')
        }

        try {
            await user.save();
        }
        catch (error) {

            throw new InternalServerErrorException(error.sqlMessage);

        }
    }


    async listUser(paginationOption: ListUserDto, orderBy: OrderByEnum): Promise<{ data: User[], TotalReseult: number }> {
        const { page, search, NoOfResult } = paginationOption;

        const take = NoOfResult || 10
        const skip = page * NoOfResult || 0
        const keyword = search || ''

        const [result, total] = await this.findAndCount({
            skip: skip,
            take: take,
        });
        if (!result || total <= skip) {
            throw new NotAcceptableException('wrong PageNumber')
        }
        return { data: result, TotalReseult: total };
    }

}