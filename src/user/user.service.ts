import { Injectable, ConflictException, UnprocessableEntityException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../auth/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt'
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ListUserDto } from './dto/list-user.dto';
import { User } from 'src/entity/user.entity';
import { SaveUserDto } from './dto/save-user.dto';
import { errorMessage } from 'src/config/common.config';
import { MailerService } from "@nestjs-modules/mailer";
import { v4 as uuidv4 } from "uuid";
@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,

        private readonly mailerService: MailerService,
    ) { }

    async create(saveUserDto: SaveUserDto): Promise<User> {
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
        user.profilePic="";
        user.timezone="";
        user.status=1;
        user.roleId=2;
        user.email = email;
        user.firstName = first_name;
        user.middleName="";
        user.zipCode="";
        user.lastName = last_name;
        user.salt = salt;
        user.createdDate = new Date();
        user.updatedDate = new Date();
        user.password = await this.userRepository.hashPassword(password, salt);

        const userExist = await this.userRepository.findOne({
            email
        })

        if(userExist){
            throw new ConflictException(`This email address is already registered with us. Please enter different email address .`);
        }
        else{
            await user.save();
            delete user.password;
            delete user.salt;
            this.mailerService.sendMail({
                to: "suresh@itoneclick.com",
                from: "no-reply@laytrip.com",
                subject: `Welcome on board`,
                template: "welcome.html",
                context: {
                    // Data to be sent to template files.
                    username: user.firstName + " " + user.lastName,
                    email: email,
                    password:password
                },
            }).then((res) => {
                console.log("res", res);
            })
            .catch((err) => {
                console.log("err", err);
            });

            return user;
        }
    }

    async updateUser(updateUserDto: UpdateUserDto, UserId: string){
        return await this.userRepository.updateUser(updateUserDto, UserId)
    }

    async getUserData(userId: string): Promise<User> {

        try{

            const user =  await this.userRepository.findOne({
                where: { userId, isDeleted:false }
            })

            if (!user) {
                throw new NotFoundException(`No user found`);
            }
            delete user.salt;
            delete user.password;
            return user ;
        }
        catch(error){

            if (typeof error.response!=='undefined' && error.response.statusCode == 404) {
                throw new NotFoundException(`No user found`);
            }
            throw new InternalServerErrorException(`${error.message}&&&id&&&${errorMessage}`)
        }

        
    }


    async changePassword(changePasswordDto: ChangePasswordDto, userId: string) {
        return await this.userRepository.changePassword(changePasswordDto, userId);
    }


    async listUser(paginationOption: ListUserDto): Promise<{ data: User[], TotalReseult: number }> {
        return await this.userRepository.listUser(paginationOption);
    }

    async deleteUser(userId:string){

        try{
            const user = await this.userRepository.findOne({
                userId, isDeleted:false
            });

            if(!user)
                throw new NotFoundException(`No user found`)
            else{
                user.isDeleted=true;
                await user.save();
                return { messge: `User deleted successfully` }
            }
        }
        catch(error){

            if (typeof error.response!=='undefined' && error.response.statusCode == 404) {
                throw new NotFoundException(`No user Found.&&&id`)
            }
            
            throw new InternalServerErrorException(`${error.message}&&&id&&&${errorMessage}`)
        }
        
    }
}
