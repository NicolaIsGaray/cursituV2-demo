export class User {
    id?: string;
    name!: string;
    email!: string;
    password!: string;
    dni!: string;
    role!: string;
    comission!: string[];
    classroom_number!: number;
    subjects_id?: string[];
    hasGroup!: boolean;
}