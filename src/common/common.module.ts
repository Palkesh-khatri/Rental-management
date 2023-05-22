import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { SequelizeModule } from '@nestjs/sequelize';
import {Organization} from '../organization/entities/organization.entity'
import { User} from '../Model/user.entity'
import { CommonService } from './common.service';


@Module({

  imports: [CacheModule.register() ,SequelizeModule.forFeature([Organization,User])],
  providers: [CommonService],
  controllers: [],
  exports: [SequelizeModule, CommonService]

})
export class CommonModule {}
