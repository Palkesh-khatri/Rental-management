import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE, DEVELOPMENT, TEST, PRODUCTION } from '../constants';
import { databaseConfig } from './datbase.config';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/Model/user.entity';
import { Organization } from 'src/organization/entities/organization.entity';
import { UserRole } from 'src/Model/userRole.entity';
import { BusinessOwner } from 'src/Model/businessOwner.entity';



export const databaseProviders = [
    {
        provide: SEQUELIZE,
        useFactory: async () => {
            let config;
            switch (process.env.NODE_ENV) {
                case DEVELOPMENT:
                    config = databaseConfig.development;
                    break;
                case TEST:
                    config = databaseConfig.test;
                    break;
                case PRODUCTION:
                    config = databaseConfig.production;
                    break;
                default:
                    config = databaseConfig.development;
            }
            const sequelize = new Sequelize(config);            
            sequelize.addModels([
                User, Organization, UserRole, BusinessOwner 
            ]);
            await sequelize.sync(); 
            // await sequelize.sync({force:true}); //force create new tables
            return sequelize;
        },
    },
];
