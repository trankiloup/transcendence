export interface PvpMatchInterface {
    match_id: number;
    created: Date;
    player_login: string;
    opponent: string;
    player_score: number;
    opponent_score: number;
    win: boolean;
}
