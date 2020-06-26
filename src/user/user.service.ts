import { Injectable, ConflictException, UnprocessableEntityException, InternalServerErrorException } from '@nestjs/common';
import { UserRepository } from '../auth/user.repository';
import { InjectRepository } from '@nestjs/typeorm';

// import * as bcrypt from 'bcrypt'
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ListUserDto } from './dto/list-user.dto';
import { OrderByEnum } from './orderby.enum';
import { User } from 'src/entity/user.entity';
import { CreateUserDto } from 'src/auth/dto/crete-user.dto';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        return await this.userRepository.saveUser(createUserDto);
    }

    async updateProfile(updateUserDto: UpdateUserDto, UserId: string): Promise<void> {
        return await this.userRepository.updateProfile(updateUserDto, UserId)
    }

    async getUserData(userId: number): Promise<User> {
        const user =  await this.userRepository.findOne({
            where: { user_id: userId }
        })
        if (!user) {
            throw new InternalServerErrorException('Given Id not Found');
        }
        return user ;
    }


    async changePassword(changePasswordDto: ChangePasswordDto, userId: string) {
        return await this.userRepository.changePassword(changePasswordDto, userId);
    }


    async listUser(paginationOption: ListUserDto, orderBy: OrderByEnum): Promise<{ data: User[], TotalReseult: number }> {
        return await this.userRepository.listUser(paginationOption, orderBy);
    }
}
