import { Task } from "./task.model";

export type Category = {
    id: number;
    title: string;
    description?: string;
    tasks: Array<Task>
}

