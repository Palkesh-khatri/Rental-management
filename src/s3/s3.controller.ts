import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { S3Service } from './s3.service';
import { FilesInterceptor } from "@nestjs/platform-express";


@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post("uploads-files")
  @UseInterceptors(FilesInterceptor("images"))
  async uploadFiles(@UploadedFiles() files) {
    return this.s3Service.uploadFile(files);
  }
}
