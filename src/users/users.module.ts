import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/Model/user.entity';
import { MailModule } from 'src/mail/mail.module';
import { CommonService } from 'src/common/common.service';
import { CommonModule } from 'src/common/common.module';
import { MailService } from 'src/mail/mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserRole } from 'src/Model/userRole.entity';
import { BusinessOwner } from 'src/Model/businessOwner.entity';
import { Organization } from 'src/organization/entities/organization.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt/dist';
import { OrganizationService } from 'src/organization/organization.service';
import { S3Service } from 'src/s3/s3.service';

@Module({
  imports:[
    // SequelizeModule.forFeature([User]), MailModule, CommonModule
    SequelizeModule.forFeature([User, UserRole, BusinessOwner, Organization]),
    JwtModule.register({
      secret: 'gfg_jwt_secret_key',
      signOptions: {
          expiresIn: 3600,
      }
  }), UsersModule, CacheModule.register(), 
  ],
  controllers: [UsersController],
  providers: [UsersService, OrganizationService, S3Service, MailService, ConfigService, CommonService]
})
export class UsersModule {}
