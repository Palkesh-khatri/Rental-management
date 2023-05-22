import { BelongsTo, BelongsToMany, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { BusinessOwner } from 'src/Model/businessOwner.entity';
import { User } from 'src/Model/user.entity';

@Table({ tableName: 'organization' })
export class Organization extends Model {

  @Column({type: DataType.JSON})
  logoUrl: string;

  @Column
  orgName:string

  @Column
  phoneNumber: string;

  @Column
  country: string;

  @Column
  address: string;

  @Column
  state: string;

  @Column
  city: string;

  @Column
  pinCode: string;

  @Column
  prefferedCurrencies: string;

  @Column
  pageContent_TnC: string;

  @Column
  pageContent_PrivacyPolicy: string;

  // 1 for active, 0 for inactive
  @Column({ defaultValue:"0"})
  status: string;

 
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER,allowNull: false,})
  createdBy: number;
  @BelongsTo(() => User,{ onUpdate: "CASCADE", onDelete: "CASCADE",foreignKey: "createdBy",as:'createdBY'})
  created: User;

  @ForeignKey(() => User)
  @Column({type: DataType.INTEGER, })
  updatedBy:number;
  @BelongsTo(() => User,  { onUpdate: "CASCADE", onDelete: "CASCADE",foreignKey: "updatedBy" ,as: 'updated_business'})
  updated: User;

  @BelongsToMany(() => User, { as: 'userOBJ', through: () => BusinessOwner, foreignKey: "organizationId", } )
  userOBJ: User[];

}
