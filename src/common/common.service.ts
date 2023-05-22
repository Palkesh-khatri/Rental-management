import { Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CACHE_MANAGER } from "@nestjs/cache-manager";

@Injectable()
export class CommonService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager : Cache){}

  async getModifiedResponse(userObj:any) {
    if(userObj){
        let user = {};
        user["id"] = userObj.id;
        user["email"] = userObj.email;
        user["firstName"] = userObj.firstName;
        user["lastName"] = userObj.lastName;
        user["phone"] = userObj.phone;
        user["roles"] = userObj.roles;
        user["orgOBJ"] = userObj.orgOBJ;
        if(userObj.orgOBJ && userObj.orgOBJ.length > 0){
            let orgId = userObj.orgOBJ.map((org)=> org.id  )
            user["organizationId"] = await this.cacheManager.set('organizationId', orgId);
        }
      return user;         
    }
  }

}
