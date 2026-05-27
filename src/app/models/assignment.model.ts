export class Assignment {
    id?: string;
    title!: string;
    content!: string;
    date_limit!: Date;
    allowed_format!: string;
    type!: string;
    enabled_to_deliver!: boolean;
    subject_id!: string;
    sentBy?: string[];
}