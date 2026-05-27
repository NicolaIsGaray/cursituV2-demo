import { Assignment } from "../assignment.model";
import { Topic } from "../topic.model";

export interface TopicDTO {
    topic: Topic;
    assignment: Assignment;
    mode: string;
    classroom_id: string;
}