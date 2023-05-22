import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { promisify } from 'util';
import ConfigData from "../config";




@Injectable()
export class S3Service {

  private s3: AWS.S3;
  private sts: AWS.STS;

  constructor() {
    this.sts = new AWS.STS();
    this.s3 = new AWS.S3();
  }

  async uploadFile(imageFile: any){
    try{
      const assumeRoleParams = {
        RoleArn: process.env.ROLE_ARN,
        RoleSessionName: process.env.RoleSessionName,
      };
  
      const assumeRole = promisify(this.sts.assumeRole).bind(this.sts);
      const assumeRoleResponse = await assumeRole(assumeRoleParams);

      const s3 = new AWS.S3({
        accessKeyId: assumeRoleResponse.Credentials.AccessKeyId,
        secretAccessKey: assumeRoleResponse.Credentials.SecretAccessKey,
        region: assumeRoleResponse.Credentials.SessionToken,
      });

      const finalData = await Promise.all(
        imageFile.map(async(item, index)=>{
          if(item && item.originalname ){
            const uploadParams = {
              Bucket: process.env.BUCKET,
              Key: Date.now() + "-" + item.originalname,
              Body: item.buffer,
            };
            const uploadData =  await s3.upload(uploadParams).promise();
            let urlParts = uploadData.Location.split('/');
            let imgUrl = ConfigData.AWS_REPLACE_URL+'/'+ urlParts[urlParts.length-1]
            console.log("imgUrl: " + imgUrl);
            return { [`url_${index}`]: imgUrl };
          }
          else{
            return { [`url_${index}`]: item };
          }
        })
      )
      return Object.assign({}, ...finalData);
    }catch(error){
      console.log("Error uploading file:", error);
      throw error;
    }
  }
}
