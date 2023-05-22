import { Column, Model, Table, BelongsTo, ForeignKey, DataType } from "sequelize-typescript";
import { User } from "./user.entity";

let  role = {
  "superAdmin" : 1,
  "businessOwner" : 2,
  "customer" : 3
}

@Table({ tableName: 'userRole' })
export class UserRole extends Model {

  @ForeignKey(()=> User)
  @Column({type: DataType.INTEGER, })
  userId: number;
  @BelongsTo(()=> User, {onUpdate:'CASCADE', onDelete:"CASCADE", foreignKey: "userId"})
  user:User;

  // @ForeignKey(()=> RolesMST)
  // @Column({type: DataType.INTEGER, })
  // roleId: number;
  // @BelongsTo(() => RolesMST,{ onUpdate: "CASCADE", onDelete: "CASCADE", foreignKey: "roleId"})
  // role: RolesMST;

  // @ForeignKey(() => RolesMST)
  // @Column({
  //     type: DataType.INTEGER
  // })
  // roleId:number;
  // @BelongsTo(() => RolesMST,{ onUpdate: "CASCADE", onDelete: "CASCADE",foreignKey: "roleId"})
  // role: RolesMST;

// 0=> super admin 1 = admin 2 = customer
  @Column({ type: DataType.ENUM, values: ["2","1", "0"], defaultValue: "0" })
  roleId: string;

  @ForeignKey(()=> User)
  @Column({type:DataType.INTEGER, })
  createdBy: number;
  @BelongsTo(()=> User, {onUpdate:'CASCADE', onDelete:"CASCADE", foreignKey: "createdBy"})
  created: User;

  @ForeignKey(()=> User)
  @Column({type:DataType.INTEGER, })
  updatedBy: number;
  @BelongsTo(()=> User, {onUpdate:'CASCADE', onDelete:"CASCADE", foreignKey: "updatedBy"})
  updated: User;
}