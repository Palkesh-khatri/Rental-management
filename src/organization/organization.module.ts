import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Organization } from './entities/organization.entity';
import { User } from 'src/Model/user.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { CommonService } from 'src/common/common.service';
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { S3Module } from 'src/s3/s3.module';
import { S3Service } from 'src/s3/s3.service';

@Module({
  imports: [CacheModule.register(), SequelizeModule.forFeature([Organization,User]),  
  S3Module],
  controllers: [OrganizationController],
  providers: [OrganizationService, CommonService, S3Service, UsersService, MailService, JwtService],
  exports: [OrganizationService, SequelizeModule]
})
export class OrganizationModule {}
