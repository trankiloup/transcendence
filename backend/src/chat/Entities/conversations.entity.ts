import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/user/Entities/user.entity';
import { PrivateMessage } from './priv-msg.entity';

@Entity()
export class Conversations {
  @PrimaryGeneratedColumn({
    type : 'bigint',
    name: 'id'
  })
  room: number;

  @OneToMany(type => PrivateMessage, message => message.conversation)
  messages: PrivateMessage[];

  @Column({
    default: 0,
    })
  id_1: number;

  @ManyToOne(type => User,
    {
      eager: true,
    })
  @JoinColumn()
  user_1: User;

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
}