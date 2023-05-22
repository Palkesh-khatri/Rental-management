import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';


@ApiBearerAuth('Authorization')
@ApiTags('Organization')
@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post('create')
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationService._createOrg(createOrganizationDto);
  }


  @Post('test_create')
  @UseInterceptors(FilesInterceptor('images'))
  signup( @UploadedFiles() files, @Body() body: CreateOrganizationDto) {
  const bodyData = JSON.parse(JSON.stringify(body));
  const bodyData_v = JSON.parse(bodyData.data);
  return this.organizationService._createOrgImg(bodyData_v,files);
  }

  // @Get()
  // findAll() {
  //   return this.organizationService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.organizationService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
  //   return this.organizationService.update(+id, updateOrganizationDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.organizationService.remove(+id);
  // }
}
