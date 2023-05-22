import { IsNotEmpty, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {

  @IsNotEmpty({  message: 'first name required.', })
  @ApiProperty()
  firstName: string;

  @IsNotEmpty({  message: 'last name required.', })
  @ApiProperty()
  lastName: string;

  @IsNotEmpty({  message: 'email name required.', })
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty({  message: 'password is required.', })
  @MinLength(8)
  @ApiProperty()
  password: string;


  @ApiProperty()
  createdBy: number;

  
  @ApiProperty()
  updatedBy: number;

  // @IsNotEmpty({  message: 'Date of birth is required.', })
  // @ApiProperty()
  // dob: string;


  //For Organization

  @IsNotEmpty({  message: 'orgName is required.', })
  @ApiProperty()
  orgName: string;

  @ApiProperty()
  phoneNumber: string;

  @IsNotEmpty({  message: 'address is required.', })
  @ApiProperty()
  address: string;

  @IsNotEmpty({  message: 'country is required.', })
  @ApiProperty()
  country: string;

  @IsNotEmpty({  message: 'state is required.', })
  @ApiProperty()
  state: string;

  @ApiProperty()
  city: string;

  @IsNotEmpty({  message: 'Zip code is required.', })
  @MinLength(6)
  @ApiProperty()
  pinCode: string;

  @ApiProperty()
  prefferedCurrencies:JSON;

  @ApiProperty()
  pageContent_TnC:string;

  @ApiProperty()
  pageContent_PrivacyPolicy:string;

  @ApiProperty({example:'0 => super admin, 1 =>business owner,2=>user'})
  role : string;
}

export class LoginDto {
  @IsNotEmpty({  message: 'EMAIL_IS_REQUIRED' })
  @IsEmail({})
  @ApiProperty()
  email: string;

  @IsNotEmpty({  message: 'PASSWORD_IS_REQUIRED' })
  @MinLength(6,{  message: 'MINIMUM_SIX_DIGIT' } )
  @ApiProperty()
  password: string;
}

export class verifyOtpDto {
  @IsNotEmpty({  message: 'EMAIL_IS_REQUIRED' })
  @IsEmail({})
  @ApiProperty()
  email: string;


  @ApiProperty()
  emailOtp: number;
}


export class validateEmail{
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;
}

export class resetPassword{
  @IsNotEmpty()
  @ApiProperty()
  verificationToken: string;

  @IsNotEmpty()
  @ApiProperty()
  newPassword: string;
}

export class validateOtp{
  // @IsNotEmpty({  message: 'OTP_IS_REQUIRED' })
  @ApiProperty()
  otp: number;

  @ApiProperty()
  @IsNotEmpty({  message: 'EMAIL_IS_REQUIRED' })
  @IsEmail()
  email: string;
}