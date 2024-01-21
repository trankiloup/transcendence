import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/user/Entities/user.entity';

export enum relationStatus{
  NONE = 0,
  PENDING = 1,
  INVITED = 2,
  FRIEND = 3,
  BLOCKED = -1,
  ME_BLOCKED = -2
}

@Entity()
export class Relations {
  @PrimaryGeneratedColumn({
    type : 'bigint',
    name: 'id'
  })
  id: number;

  @Column({
    default: 0,
    })
  id_1: number;

  @Column({
    type: "enum",
    enum : relationStatus,
    default: relationStatus.NONE,
  })
  status: relationStatus;

  @Column({
    default: 0,
  })
  id_2: number;

  @ManyToOne(type => User,
  {
    eager: true,
  })
  @JoinColumn()
  user_2: User;

  @ManyToOne(type => User, user => user.relations)
  relation: User;
}