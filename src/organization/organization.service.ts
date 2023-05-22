import { BadGatewayException, ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import globalMsg from 'src/common/globalMsg';
import { Organization} from './entities/organization.entity';
import { Op, Transaction } from "sequelize";
import { User } from 'src/Model/user.entity';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from "bcrypt";
import { UserRole } from 'src/Model/userRole.entity';
import { BusinessOwner } from 'src/Model/businessOwner.entity';
import { MailService } from 'src/mail/mail.service';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class OrganizationService {

  constructor(
    @InjectModel(Organization) private readonly orgModel: typeof Organization,
    private emailService: MailService,
    private readonly s3Service: S3Service
  ){}
  
  async _createOrg(createOrganizationDto:CreateOrganizationDto){
    let { email } = createOrganizationDto
    const user = await User.findOne({where:{email:email }})
    await this._findOrganizationByName(createOrganizationDto.orgName);
      if(!user) {
        const t: Transaction = await this.orgModel.sequelize.transaction();
        try{
          const password = createOrganizationDto.password
          const hashedPassword = await bcrypt.hash(password, 10)
          let otp = Math.floor(1000 + Math.random() * 9000);
          let userSave = new User();
          userSave.firstName = createOrganizationDto.firstName;
          userSave.lastName = createOrganizationDto.lastName;
          userSave.phoneNumber = createOrganizationDto.phoneNumber;
          userSave.email = createOrganizationDto.email;
          userSave.emailOtp = otp;
          userSave.password = hashedPassword;
          userSave.isEmailVerified = true;
          userSave.status = createOrganizationDto.status;
          let savedUser = await userSave.save({ transaction: t });
          if(savedUser){
            let organization = new Organization()
            createOrganizationDto.createdBy = createOrganizationDto.createdBy? createOrganizationDto.createdBy: savedUser.id;
            createOrganizationDto.updatedBy = createOrganizationDto.updatedBy? createOrganizationDto.updatedBy: savedUser.id;
            organization.orgName = createOrganizationDto.orgName
            organization.address = createOrganizationDto.address
            organization.city = createOrganizationDto.city
            organization.pinCode = createOrganizationDto.pinCode
            organization.pageContent_TnC = createOrganizationDto.pageContent_TnC
            organization.pageContent_PrivacyPolicy = createOrganizationDto.pageContent_PrivacyPolicy
            organization.prefferedCurrencies = JSON.stringify(createOrganizationDto.prefferedCurrencies)
            organization.country = createOrganizationDto.country
            organization.state = createOrganizationDto.state
            organization.createdBy = createOrganizationDto.createdBy? createOrganizationDto.createdBy: savedUser.id;
            organization.updatedBy = createOrganizationDto.updatedBy? createOrganizationDto.updatedBy: savedUser.id;
            const saveOrganization: any = await organization.save({ transaction: t });
            if(saveOrganization){
              let role = new UserRole();
              role.userId = savedUser.id
              role.roleId = createOrganizationDto.role;
              role.createdBy = createOrganizationDto.createdBy ? createOrganizationDto.createdBy: savedUser.id;
              role.updatedBy = createOrganizationDto.updatedBy? createOrganizationDto.updatedBy: savedUser.id;
              const saveRole: any = await role.save({ transaction: t });
              if(saveRole){
                let ownerRelation = new BusinessOwner();
                ownerRelation.userId = savedUser.id;
                ownerRelation.organizationId = saveOrganization.id;
                ownerRelation.createdBy = createOrganizationDto.createdBy ? createOrganizationDto.createdBy: savedUser.id;
                ownerRelation.updatedBy = createOrganizationDto.updatedBy? createOrganizationDto.updatedBy: savedUser.id;
                const saveOwnerRelation: any = await ownerRelation.save({ transaction: t });
                if(saveOwnerRelation){
                  await t.commit();
                  try{
                    let data = {
                      context: {
                        message: `Your organization is created successfully, Please check login with the given credential.
                        Email: ${createOrganizationDto.email}
                        Password: ${createOrganizationDto.password}`,
                        subject: "Confirmation Mail",
                        name: userSave.firstName,
                      },
  
                      subject: "Confirmation Mail",
                      template: "./confirmation",
                    };
                    let mailsend = await this.emailService.sendMail(email, data)
                    return {
                      statusCode: 200,
                      message: globalMsg.common.CREATED_SUCCESSFULLY,
                      data: savedUser,
                      mailSend: mailsend,
                    };
                  }catch (error) {
                    return {
                      statusCode: 200,
                      message: globalMsg.auth.ERROR_SENDING_MAIL,
                      data: savedUser,
                    };
                  }
                }else{
                  await t.rollback();
                  return {
                    statusCode: 502,
                    message: globalMsg.auth.COULD_NOT_ASSIGN_ROLE,
                    data: null,
                  };
                }
              }else{
                await t.rollback();
                return {
                  statusCode: 502,
                  message: globalMsg.auth.COULD_NOT_ASSIGN_ROLE,
                  data: null,
                };
              }
            }else{
              await t.rollback();
              return {
                statusCode: 502,
                message: globalMsg.errors.COMPANY_COULD_NOT_BE_REGISTERED,
                data: null,
              };
            }
          }else{
            await t.rollback();
            return {
              statusCode: 502,
              message: globalMsg.errors.COMPANY_COULD_NOT_BE_REGISTERED,
              data: null,
            };
          }
        }
        catch(error){
          await t.rollback();
          throw new BadGatewayException(error);
        }
      }else{
      throw new ConflictException(globalMsg.auth.USER_ALREADY_REGISTERED);
      }
  }

  async _createOrgImg(createOrganizationDto:CreateOrganizationDto, ImageFile){
      let { email } = createOrganizationDto
      const user = await User.findOne({where:{email:email }})
      await this._findOrganizationByName(createOrganizationDto.orgName);
        if(!user) {
          const t: Transaction = await this.orgModel.sequelize.transaction();
          try{
            const password = createOrganizationDto.password
            const hashedPassword = await bcrypt.hash(password, 10)
            let otp = Math.floor(1000 + Math.random() * 9000);
            let userSave = new User();
            userSave.firstName = createOrganizationDto.firstName;
            userSave.lastName = createOrganizationDto.lastName;
            userSave.phoneNumber = createOrganizationDto.phoneNumber;
            userSave.email = createOrganizationDto.email;
            userSave.emailOtp = otp;
            userSave.password = hashedPassword;
            userSave.isEmailVerified = true;
            userSave.status = createOrganizationDto.status;
            let savedUser = await userSave.save({ transaction: t });
            if(savedUser){
              let organization = new Organization()
              createOrganizationDto.createdBy = createOrganizationDto.createdBy? createOrganizationDto.createdBy: savedUser.id;
              createOrganizationDto.updatedBy = createOrganizationDto.updatedBy? createOrganizationDto.updatedBy: savedUser.id;
              organization.orgName = createOrganizationDto.orgName
              organization.address = createOrganizationDto.address
              organization.city = createOrganizationDto.city
              organization.pinCode = createOrganizationDto.pinCode
              organization.pageContent_TnC = createOrganizationDto.pageContent_TnC
              organization.pageContent_PrivacyPolicy = createOrganizationDto.pageContent_PrivacyPolicy
              organization.prefferedCurrencies = JSON.stringify(createOrganizationDto.prefferedCurrencies)
              organization.country = createOrganizationDto.country
              organization.state = createOrganizationDto.state
              organization.createdBy = createOrganizationDto.createdBy? createOrganizationDto.createdBy: savedUser.id;
              organization.updatedBy = createOrganizationDto.updatedBy? createOrganizationDto.updatedBy: savedUser.id;
              
              if(ImageFile  && ImageFile.length > 0){
                const img = await this.s3Service.uploadFile(ImageFile)
                organization["logoUrl"] = img;
              }
              const saveOrganization: any = await organization.save({ transaction: t });
              if(saveOrganization){
                let role = new UserRole();
                role.userId = savedUser.id
                role.roleId = createOrganizationDto.role;
                role.createdBy = createOrganizationDto.createdBy ? createOrganizationDto.createdBy: savedUser.id;
                role.updatedBy = createOrganizationDto.updatedBy? createOrganizationDto.updatedBy: savedUser.id;
                const saveRole: any = await role.save({ transaction: t });
                if(saveRole){
                  let ownerRelation = new BusinessOwner();
                  ownerRelation.userId = savedUser.id;
                  ownerRelation.organizationId = saveOrganization.id;
                  ownerRelation.createdBy = createOrganizationDto.createdBy ? createOrganizationDto.createdBy: savedUser.id;
                  ownerRelation.updatedBy = createOrganizationDto.updatedBy? createOrganizationDto.updatedBy: savedUser.id;
                  const saveOwnerRelation: any = await ownerRelation.save({ transaction: t });
                  if(saveOwnerRelation){
                    await t.commit();
                    try{
                      let data = {
                        context: {
                          message: `Your organization is created successfully, Please check login with the given credential.
                          Email: ${createOrganizationDto.email}
                          Password: ${createOrganizationDto.password}`,
                          subject: "Confirmation Mail",
                          name: userSave.firstName,
                        },
    
                        subject: "Confirmation Mail",
                        template: "./confirmation",
                      };
                      let mailsend = await this.emailService.sendMail(email, data)
                      return {
                        statusCode: 200,
                        message: globalMsg.common.CREATED_SUCCESSFULLY,
                        data: savedUser,
                        mailSend: mailsend,
                      };
                    }catch (error) {
                      return {
                        statusCode: 200,
                        message: globalMsg.auth.ERROR_SENDING_MAIL,
                        data: savedUser,
                      };
                    }
                  }else{
                    await t.rollback();
                    return {
                      statusCode: 502,
                      message: globalMsg.auth.COULD_NOT_ASSIGN_ROLE,
                      data: null,
                    };
                  }
                }else{
                  await t.rollback();
                  return {
                    statusCode: 502,
                    message: globalMsg.auth.COULD_NOT_ASSIGN_ROLE,
                    data: null,
                  };
                }
              }else{
                await t.rollback();
                return {
                  statusCode: 502,
                  message: globalMsg.errors.COMPANY_COULD_NOT_BE_REGISTERED,
                  data: null,
                };
              }
            }else{
              await t.rollback();
              return {
                statusCode: 502,
                message: globalMsg.errors.COMPANY_COULD_NOT_BE_REGISTERED,
                data: null,
              };
            }
          }
          catch(error){
            await t.rollback();
            throw new BadGatewayException(error);
          }
        }else{
        throw new ConflictException(globalMsg.auth.USER_ALREADY_REGISTERED);
        }
  }


  async _findOrganizationByName(orgName: string, id?: number) {
    let where : any;
    if(id){
      where = { orgName: orgName, id:{[Op.ne]: id} }
    }else{
      where = { orgName: orgName }
    }
    const findOrg = await Organization.findOne({ where });
    if (findOrg)
      return {
        statusCode: 403,
        message: globalMsg.errors.ORGANIZATION_ALREADY_EXIST,
        data: null,
      };
    else findOrg;
  }
}
