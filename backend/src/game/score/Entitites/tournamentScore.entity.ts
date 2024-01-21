import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class tournamentScoreEntity{
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
    player1_rank: string;

    @Column({
        default: "",
    })
    player2_rank: string;

    @Column({
        default: "",
    })
    player3_rank: string;

    @Column({
        default: "",
    })
    player4_rank: string;

}



