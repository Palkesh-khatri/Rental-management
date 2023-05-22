import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, LoginDto, resetPassword, validateEmail, validateOtp, verifyOtpDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { verify } from 'crypto';
import { Request } from 'express';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  create(@Body() createUserDto: CreateUserDto) {
    console.log('createUserDto', createUserDto)
    return this.usersService._register(createUserDto);
  }

  @Post('login')
  login(@Body() createLogin: LoginDto) {
    return this.usersService._login(createLogin, false);
  }

  @Post("verifyotp")
  verifyotp(@Body() verifyOTP: verifyOtpDto) {
    return this.usersService._verifyOtp(verifyOTP);
  }

  @Post("forgotpassword")
  forgotpassword(@Body() validateEmail: validateEmail, @Req() req: Request) {
    return this.usersService._forgotPassword(validateEmail, req);
  }

  @Post("resetpassword")
  resetpassword(@Body() resetPassword: resetPassword) {
    return this.usersService._resetPassword(resetPassword);
  }

  @Post("resendotp")
  resendotp(@Body() resendOtp: validateOtp) {
    return this.usersService._resendOTP(resendOtp);
  }

}
