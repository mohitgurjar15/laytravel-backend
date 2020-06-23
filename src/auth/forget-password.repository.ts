import { Repository, EntityRepository, QueryBuilder, Like, Timestamp } from "typeorm";
import { forget_password } from "src/entity/forget-password.entity";

@EntityRepository(forget_password)
export class ForgetPassWordRepository extends Repository<forget_password>
{
    
}