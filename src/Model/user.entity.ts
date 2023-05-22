import { BelongsToMany, Column, DataType, Model, Table } from 'sequelize-typescript';
import { UserRole } from './userRole.entity';
import { Organization } from 'src/organization/entities/organization.entity';
import { BusinessOwner } from './businessOwner.entity';
import { Exclude } from 'class-transformer';

@Table({ tableName: 'users' })
export class User extends Model{

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  firstName: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  lastName: string;

  @Column({
    type: DataType.STRING,
    // allowNull: false,
  })
  phoneNumber: string;

  @Column({
    unique: true,
    type: DataType.STRING,
    allowNull: false,
  })
  email: string;

  
  @Exclude({toClassOnly: true, toPlainOnly: true})
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  password: string;

  @Column({
    allowNull: true,
  })
  verificationToken: string;

  @Column({})
  tokenExpiry: Date;


  // 1 for active, 0 for inactive
  @Column({defaultValue:"0"})
  status: string;
  
  @Column({})
  isEmailVerified: boolean;

  @Column({allowNull: true})
  emailOtp: number;

  @Column({})
  createdBy: number;

  @Column({})
  updatedBy: number;

  @Column({})
  lastLoginAt: Date;


  @Column({  })
  createdAt?: Date;

  // @HasMany(() => UserRole, "userId")
  // userRole: UserRole[];



  
 // relation between three table here BusinessOwner is mediator for user and organization and orgOBJ is unique alias for connect self id is foreignkey for businessOwner table
  @BelongsToMany(() => Organization, { as: 'orgOBJ', through: () => BusinessOwner, foreignKey: "userId", } )
  orgOBJ: Organization[];


}


