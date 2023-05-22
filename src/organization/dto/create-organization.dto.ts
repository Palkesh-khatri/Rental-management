import { IsNotEmpty, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationDto {

  //For Organization

  logoUrl: string;

  @IsNotEmpty({  message: 'orgName is required.', })
  @ApiProperty()
  orgName: string;


  @IsNotEmpty({  message: 'address is required.', })
  @ApiProperty()
  address: string;

  @ApiProperty()
  city: string;

  @IsNotEmpty({  message: 'Zip code is required.', })
  @MinLength(6)
  @ApiProperty()
  pinCode: string;

  @ApiProperty()
  pageContent_TnC:string;

  @ApiProperty()
  pageContent_PrivacyPolicy:string;

  @ApiProperty({default:{"en":"$"}})
  prefferedCurrencies:JSON;

  status:string

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
  phoneNumber: string;


  @IsNotEmpty({  message: 'country is required.', })
  @ApiProperty()
  country: string;

  @IsNotEmpty({  message: 'state is required.', })
  @ApiProperty()
  state: string;

  @ApiProperty()
  createdBy: number;

  
  @ApiProperty()
  updatedBy: number;

  @ApiProperty({example:'0 => super admin, 1 =>business owner,2=>user'})
  role : string;

  // @IsNotEmpty({  message: 'Date of birth is required.', })
  // @ApiProperty()
  // dob: string;

}


