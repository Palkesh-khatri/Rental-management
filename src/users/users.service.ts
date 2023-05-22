import { BadRequestException, ConflictException, ForbiddenException, NotFoundException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, LoginDto, resetPassword, validateEmail, validateOtp, verifyOtpDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import  globalMsg from '../common/globalMsg'
import { Transaction } from 'sequelize';
import { User } from 'src/Model/user.entity';
import { Organization } from 'src/organization/entities/organization.entity';
import { UserRole } from 'src/Model/userRole.entity';
import { BusinessOwner } from 'src/Model/businessOwner.entity';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CommonService } from 'src/common/common.service';
import { OrganizationService } from 'src/organization/organization.service';

@Injectable()
export class UsersService {
  
  constructor(  
    private emailService: MailService,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
    private commonService : CommonService,
    private organizationsService: OrganizationService
    ) {}

  async _register(createUserDto: CreateUserDto) {
    let email: any = createUserDto.email;

    //check if user exist and return
    const findUser = await User.findOne({where:{email: createUserDto.email}});
    if( findUser ) throw new ConflictException( globalMsg.auth.USER_ALREADY_REGISTERED );

    // const org = await this.organizationsService._findOrganizationByName(createUserDto.orgName);

    //register process start
    const t: Transaction = await User.sequelize.transaction();
  try{
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    let otp = Math.floor(1000 + Math.random() * 9000);

    const createUser = new User();
      createUser.firstName = createUserDto.firstName
      createUser.lastName = createUserDto.lastName
      createUser.email = email
      createUser.emailOtp = otp
      createUser.isEmailVerified = false
      createUser.password = hashedPassword
      const saveUser = await createUser.save({transaction: t})
      console.log('saveUser', saveUser)
      let setUserData ={
        id: saveUser.id, 
        firstName: saveUser.firstName,
        lastName : saveUser.lastName
      }
      if(saveUser){
        createUserDto.createdBy = saveUser.id;
        createUserDto.updatedBy = saveUser.id;

        //save user's organization
        const organization = new Organization();
        organization.orgName = createUserDto.orgName;
        organization.phoneNumber = createUserDto.phoneNumber;
        organization.address = createUserDto.address;
        organization.country = createUserDto.country;
        organization.state = createUserDto.state;
        organization.city = createUserDto.city;
        organization.pinCode = createUserDto.pinCode;
        organization.prefferedCurrencies = JSON.stringify(createUserDto.prefferedCurrencies);
        organization.pageContent_TnC = createUserDto.pageContent_TnC? createUserDto.pageContent_TnC :null;
        organization.pageContent_PrivacyPolicy = createUserDto.pageContent_PrivacyPolicy ? createUserDto.pageContent_PrivacyPolicy: null;
        organization.createdBy    = saveUser.id;
        organization.updatedBy    = saveUser.id;

        const saveOrganization = await organization.save({transaction: t})
        console.log('saveOrganization', saveOrganization)

        if(saveOrganization){
          let role = new UserRole()
          role.roleId = (createUserDto.role);
          role.userId = saveUser.id;
          role.createdBy = saveUser.id;
          role.updatedBy = saveUser.id;
          
          const saveUserRole = await role.save({transaction: t})
          console.log('saveUserRole', saveUserRole)

          if(saveUserRole){
            let ownerRelation = new BusinessOwner();
            ownerRelation.userId = saveUser.id;
            ownerRelation.organizationId = saveOrganization.id;
            ownerRelation.createdBy = saveUser.id;
            ownerRelation.updatedBy = saveUser.id;
            const saveOwnerRelation = await ownerRelation.save({transaction: t})
            
            if(saveOwnerRelation){
              await t.commit()
              try{
                saveUser.password = '';                    
                let data = {
                  context: {
                    "message" :`Welcome to the application.Here is your otp: ${otp}`,
                    "name": createUser.firstName,
                  },                      
                  subject: "Otp confirmation",
                  template: "./confirmation"
                }
                let mailsend = await this.emailService.sendMail(email, data);
                return { statusCode: 200, message: globalMsg.auth.REGISTERED_SUCCESSFULLY, data: setUserData, mailSend: mailsend };
              }catch(error){
                throw new HttpException( { statusCode: 200, message: globalMsg.auth.ERROR_SENDING_EMAIL, data: setUserData }, HttpStatus.OK)
              }
            }
            else{
              await t.rollback();
              throw new HttpException( {statusCode: 502, message: globalMsg.auth.COULD_NOT_ASSIGN_ROLE, data: null }, HttpStatus.BAD_GATEWAY)
            }
          }else{
            await t.rollback();
            throw new HttpException( {statusCode: 502, message: globalMsg.auth.COULD_NOT_ASSIGN_ROLE, data: null }, HttpStatus.BAD_GATEWAY)
          }
        }     
        else{
        await t.rollback();
        throw new HttpException({
          statusCode: 502,
          message: globalMsg.auth.COULD_NOT_ASSIGN_ROLE,
          data: null,
        }, HttpStatus.BAD_GATEWAY)
      }

      }else {
        await t.rollback();
        throw new HttpException({
          statusCode: 502,
          message: globalMsg.auth.COULD_NOT_ASSIGN_ROLE,
          data: null,
        }, HttpStatus.BAD_GATEWAY);
      } 
    }catch(error){
      await t.rollback();
      throw new HttpException(
        {
        statusCode: 400,
        message: error?.message,
        data: null,
      }, HttpStatus.BAD_REQUEST);
    } 
  }

  async _login(createLogin: LoginDto, directLogin: boolean) {
    try {
      const { email, password } = createLogin;
      const user = await User.findOne({ where: { email }, include: [Organization] });
  
      if (!user) {
        throw new ForbiddenException(globalMsg.auth.NO_CUSTOMER_FOUND);
      }
  
      let match = false;
      if (!directLogin) {
        match = await bcrypt.compare(password, user.password);
      } else {
        match = true;
      }
  
      if (match) {
        if (user.status === "0") {
          throw new ForbiddenException(globalMsg.auth.INACTIVE_ACCOUNT);
        }
        if (!user.isEmailVerified) {
          throw new ForbiddenException(globalMsg.auth.EMAIL_NOT_VERIFIED);
        }
  
        const userRole = await UserRole.findOne({ where: { userId: user.id } });
        const payload = { userId: user.id, Email: user.email, roles: userRole.roleId };
        const token = this.jwtService.sign(payload, {
          secret: this.configService.get("JWT_VERIFICATION_TOKEN_SECRET"),
          expiresIn: `${this.configService.get("JWT_VERIFICATION_TOKEN_EXPIRATION_TIME")}s`,
        });
  
        // const clone = await this.commonService.getModifiedResponse(user);

        return {
          statusCode: 200,
          message: globalMsg.auth.LOGGED_IN_SUCCESSFUL,
          data: user,
          token: token,
        };
      } else {
        throw new UnauthorizedException(globalMsg.auth.PASSWORD_DOES_NOT_MATCH);
      }
    } catch (error) {
      throw new HttpException(
        {
          statusCode: 401,
          message: error.message,
          data: null,
        },
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  async _verifyOtp(verifyOTP : verifyOtpDto){
    let {email , emailOtp} = verifyOTP
    await User.findOne({where:{emailOtp:emailOtp, email:email}, include : [{ model: Organization}], attributes: ["id", "email"]})
    .then(async(user)=>{
      if(!user) throw new BadRequestException(globalMsg.errors.INVALID_OTP)

      user.emailOtp = null;
      user.isEmailVerified = true;
      user.status ="1";

      return await user.save().then(async (user) =>{
        console.log('user=============================>', user)
        if(user.orgOBJ && user.orgOBJ.length>0){
          console.log('user.orgOBJ[0].status9999999999999999999=============================>', user.orgOBJ[0].status)
          user.orgOBJ[0].status = "1"
          return await user.orgOBJ[0].save().then(async (org) =>{
            console.log('user.orgOBJ[0].status9fdshgsfghhhhhhhhhhhhhhhhhhhhh===>', org)
            if(org){
              console.log('99999999999999999999999999999999999999999=>')
              return await this._login({email: user.email, password: ""}, true)
            }else{
              throw new HttpException(
                {
                statusCode: 403,
                message: globalMsg.auth.OTP_VERIFICATION_FAILED,
                data: null,
              }, HttpStatus.FORBIDDEN);
            }
          }).catch((err)=> {
            throw new ConflictException(err.message)
          });
        }else{
          throw new NotFoundException(globalMsg.errors.NO_DATA_FOUND)
        }
      }).catch((err)=> {
        throw new ConflictException(err.message)
      });

    }).catch((err) => {
      throw new HttpException(
      {
        statusCode: 403,
        message: "NO_DATA_FOUND",
        data: null,
      }, HttpStatus.FORBIDDEN);
   });

  }

  async _forgotPassword(validateEmail: validateEmail, req){
    let {email} = validateEmail
    let user = await User.findOne({where:{email:email}})
    if(!user) throw new ForbiddenException(globalMsg.errors.NO_USER_DATA_FOUND)
    const hash = await bcrypt.hash(user.email, 10)
    user.verificationToken = hash
    let updatedData = await user.save()
    let data= {
      context:{
        action_url :`${req.protocol}://${req.get('Host')}${req.originalUrl}?token=${hash}`,
        name :user.firstName
      },
      subject: "Reset Password",
      template: "./forgotPassword"
    }
    let mailResponse = await this.emailService.sendMail(email, data)
    return {
      status:200,
      message: "MAIL_SEND",
      data: mailResponse
    }
  }

  async _resetPassword(resetPassword: resetPassword){
    let{ verificationToken, newPassword} = resetPassword
    const user = await User.findOne({where:{verificationToken : verificationToken}})
    if(!user) throw new ForbiddenException(globalMsg.errors.NO_DATA_FOUND)
    const changePassword = await bcrypt.hash(newPassword, 10);
    user.password = changePassword;
    user.verificationToken = null;
    let userSave = user.save()
    if(user.save()){
      return{
        status:200,
        message: globalMsg.auth.PASSWORD_UPDATED_SUCCESSFULLY,
        data:user
      }
    }
    else{
      throw new HttpException({
        statusCode:409, 
        message: globalMsg.auth.COULD_NOT_UPDATE_PASSWORD,
        data:user
      }, HttpStatus.CONFLICT)
    }
  }

  async _resendOTP(resendOTP : validateOtp){
    let {email } = resendOTP
    return await User.findOne({where: { email :email }}).then(async(user)=>{
      if(!user) throw new ForbiddenException(globalMsg.errors.NO_USER_EXITST)
      let newOtp = Math.floor(1000 + Math.random() * 9000);
      user.emailOtp = newOtp;
      user.isEmailVerified = false;
      let saveUser = user.save()
      if(saveUser){
        let data = {
          context:{
            "message" :`Welcome to the application.Here is your otp: ${newOtp}`,
            "name": user.firstName,
          },
          subject: "Otp confirmation",
          template: "./confirmation"
        }
        let mailsend = await this.emailService.sendMail(email, data)
        console.log('mailsend', mailsend)
        return { statusCode: 200, message: globalMsg.OTP_SENT_SUCCESSFULLY, data: [], mailSend: mailsend };
      }else{
        throw new HttpException({
          statusCode:502,
          message: globalMsg.errors.NO_DATA_FOUND,
          data:null
        }, HttpStatus.BAD_GATEWAY)
      }
    }).catch((error)=>{
      throw new HttpException({
        statusCode:400,
        message: error?.message,
        data: null,
      }, HttpStatus.CONFLICT)
    })
  }
}

