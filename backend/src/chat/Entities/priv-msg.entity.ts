import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Conversations } from './conversations.entity';
import { User } from 'src/user/Entities/user.entity';

@Entity()
export class PrivateMessage {
  @PrimaryGeneratedColumn({
    type : 'bigint',
    name: 'id'
  })
  id: number;

  @Column({
    default: 0,
    })
  id_auth: number;

  @ManyToOne(type => User,
    {
      eager: true,
    })
  @JoinColumn()
  user_auth: User;

  @Column({
    default: 0,
  })
  id_dest: number;

  @ManyToOne(type => User,
    {
      eager: true,
    })
  @JoinColumn()
  user_dest : User;

  @Column({
    default : "",
  })
  message: string;

  @Column({
    default : 0
  })
  room: number;

  @ManyToOne(type => Conversations, conversation => conversation.messages)
  conversation : Conversations;
}