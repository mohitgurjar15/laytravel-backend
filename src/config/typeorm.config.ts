import { TypeOrmModuleOptions} from '@nestjs/typeorm'
import * as config from 'config'


const dbConfig = config.get('db');



export const typeOrmConfig: TypeOrmModuleOptions={
    type: dbConfig.type,
    host: process.env.RDS_Host || dbConfig.host,
    port: process.env.RDS_Port || dbConfig.port,
    username: process.env.RDS_Username || dbConfig.username,
    password: process.env.RDS_Password || dbConfig.password,
    database: process.env.RDS_Database || dbConfig.database,
    logging:true,
    cache: true,
    entities: [
        __dirname + '/../**/entity/*.entity{.ts,.js}',
    ],
    synchronize:false,
}