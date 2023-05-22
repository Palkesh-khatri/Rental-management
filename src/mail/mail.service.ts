import { Injectable } from '@nestjs/common';
import { MailerService } from "@nestjs-modules/mailer";


@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}
  
  async sendMail(email: any, data: any) {
    try{
      const mailing =  await this.mailerService.sendMail({
        to: email,
        subject: data.subject,
        template: data.template,
        context: data.context,
      });
      console.log("success=>", mailing.response, data)
      return {statusCode: 200, user : mailing.response}

    }catch(error){
      return {statusCode: 402, error : error}
    }
  }
}
