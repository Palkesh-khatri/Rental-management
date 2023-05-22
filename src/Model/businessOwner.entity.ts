import { Column, Model, Table, BelongsTo, ForeignKey, DataType } from "sequelize-typescript";
import { User } from "./user.entity";
import { Organization } from "src/organization/entities/organization.entity";

let  status = {
  "superAdmin" : 1,
  "businessOwner" : 2,
  "customer" : 3
}

@Table({ tableName: 'businessOwner' })
export class BusinessOwner extends Model{
  
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, })
  userId:number;
  @BelongsTo(() => User,  { onUpdate: "CASCADE", onDelete: "CASCADE",foreignKey: "userId",as:'user_data'})
  user: User;

  @ForeignKey(() => Organization)
  @Column({ type: DataType.INTEGER,})
  organizationId:number;
  @BelongsTo(() => Organization, { onUpdate: "CASCADE", onDelete: "CASCADE",foreignKey: "organizationId",as:'org_data'})
  organization: Organization;


  @ForeignKey(() => User)
  @Column({type: DataType.INTEGER,})
  createdBy:number;
  @BelongsTo(() => User,  { onUpdate: "CASCADE", onDelete: "CASCADE",foreignKey: "createdBy",as: 'created_business' })
  created: User;

  @ForeignKey(() => User)
  @Column({type: DataType.INTEGER, })
  updatedBy:number;
  @BelongsTo(() => User,  { onUpdate: "CASCADE", onDelete: "CASCADE",foreignKey: "updatedBy" ,as: 'updated_business'})
  updated: User;
  
}