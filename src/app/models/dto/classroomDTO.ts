import { Topic } from "../topic.model";

export interface ClassroomDTO {
    id: string;
    subjectName: string;
    topics: Topic[];
}