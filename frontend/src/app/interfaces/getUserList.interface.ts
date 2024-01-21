export interface getUserListInterface{
    id: number;
    username: string;
    status: 'ONLINE' | 'OFFLINE' | 'INGAME';
}