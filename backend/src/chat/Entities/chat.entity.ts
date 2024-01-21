import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn({
    type : 'bigint',
    name: 'id'
  })
  id: number;

  @Column({
    default: "",
    })
  login: string;

  @Column({
    default : "",
  })
  message: string;
}