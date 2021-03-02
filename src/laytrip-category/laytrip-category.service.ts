import { Injectable } from '@nestjs/common';
import { LaytripCategory } from 'src/entity/laytrip-category.entity';
import { User } from 'src/entity/user.entity';
import { CreateLaytripCategoryDto } from './dto/add-category.dto';

@Injectable()
export class LaytripCategoryService {


    async addLaytripCategory(dto : CreateLaytripCategoryDto , user :User){
        const {name , instalmentAfter} =  dto

        const category = new LaytripCategory
        category.name = name
        category.installmentAvailableAfter = instalmentAfter ? instalmentAfter : 0
        category.status = true
        category.createBy = user.userId
        category.createDate = new Date()
        await category.save()

        return {
            message : `Category ${name} added successfully.`
        }
    }
}
