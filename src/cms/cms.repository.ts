import { EntityRepository, Repository } from "typeorm";
import { Cms } from "src/entity/cms.entity";

@EntityRepository(Cms)
export class CmsRepository extends Repository<Cms>
{

}
