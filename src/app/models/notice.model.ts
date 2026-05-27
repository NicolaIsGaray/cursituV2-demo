export class Notice {
    id?: string;
    title!: string;
    type?: string;
    message!: string;
    senderId!: string;
    created_at!: string;
    read_by?: string[];
}