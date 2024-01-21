
import { Column, Entity, PrimaryGeneratedColumn, OneToMany, JoinColumn } from 'typeorm';
import { Relations } from '../relations/Entity/relations.entity';
import { Length } from 'class-validator';

export enum userStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  INGAME = "INGAME"
}

@Entity()
export class User {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'User_id'
  })
  id: number;

  @Column({
    default: '',
  })
  username: string;

  @Column({
    default: ""
  })
  refreshToken: string

  @Column({
    default: '',
  })
  login: string;

  @Column({
    default: 'default-avatar.png'
  })
  avatarURL: string;

  @Column({
    default: ""
  })
  email: string;

  @Column({
    default: 0,
  })
  twofa: number;

  @Column({
    type: "enum",
    enum: userStatus,
    default: userStatus.ONLINE
  })
  status: userStatus

  @Column({
    default: 0
  })
  rtsRank : number

  @Column({
    default: ""
  })
  code : string
  
  @OneToMany(type => Relations, relation => relation.relation)
  relations: Relations[];

}
