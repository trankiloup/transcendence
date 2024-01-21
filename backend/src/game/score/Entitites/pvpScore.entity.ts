import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class pvpScoreEntity{
    @PrimaryGeneratedColumn({
        type : 'bigint',
        name : 'match_id'
    })
    match_id : number;

    @Column({
        default: () => 'CURRENT_TIMESTAMP',
    })
    created: Date;


    @Column({
        default: "",
    })
    player_login: string;


    @Column({
        default: "",
    })
    opponent: string;

    @Column({
        default : 0
    })
    player_score : number

    @Column({
        default : 0
    })
    opponent_score : number

    @Column({
        default : false
    })
    win : boolean
}



