import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { join } from "path";

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: "smpt.gmail.com",
        port: 1025,
        ignoreTLS: true,
        secure: false,
        service: "gmail",
        auth: {
          user: "patelparmanand708@gmail.com",
          pass: "lghgjquveotshmbo",
        },
      },
      defaults: {
        from: '"Param patel" <param@gmail.com>',
      },
      template: {
        dir: join(__dirname, "templates"),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService], // 👈 export for DI
})
export class MailModule {}

