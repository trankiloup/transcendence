import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";


export enum matchType{
    NONE = "NONE",
    PVP = "PVP",
    TOURNAMENT = "TOURNAMENT",
    OTHER = 'OTHER'
  }

export enum matchStatus{
    NONE = 'NONE',
    GLOBAL = 'GLOBAL',
    MATCH1 = 'MATCH1',
    MATCH2 = 'MACTH2',
    FINAL = 'FINAL'
}

@Entity()
export class matchEntity{
    @PrimaryGeneratedColumn({
        type : 'bigint',
        name : 'match_id',
    })
    match_id : number;

    @Column({
        default: false,
    })
    full: boolean;

    @Column({
        default: () => 'CURRENT_TIMESTAMP',
    })
    created: Date;

    @Column({
        default: 0,
    })
    player1_id: number;


    @Column({
        default: "",
    })
    player1_login: string;

    @Column({
        default: 0,
    })
    player2_id: number;


    @Column({
        default: "",
    })
    player2_login: string;

    @Column({
        default: 0,
    })
    player3_id: number;
    


    @Column({
        default: "",
    })
    player3_login: string;

    @Column({
        default: 0,
    })
    player4_id: number;

    @Column({
        default: "",
    })
    player4_login: string;

    @Column({
        default: 0,
    })
    player1_score: number;

    @Column({
        default: 0,
    })
    player2_score: number;

    @Column({
        default: false,
    })
    finished : boolean


    @Column({
        default: false,
    })
    canceled : boolean

    @Column({
        default : false
    })
    started : boolean

    @Column({
        default : 0,
        type : 'bigint',
    })
    tournament_id : number

    @Column({
        type : "enum",
        enum : matchType,
        default : matchType.NONE
    })
    matchType : matchType

    @Column({
        type : 'enum',
        enum : matchStatus,
        default : matchStatus.NONE
    })
    matchStatus : matchStatus

    @Column({
        default :0
    })
    rtsRank : number
}