export type Task = {
    id: number;
    title: string;
    description?: string;
    date: Date;
    status: 'To Do' | 'In Progress' | 'Done';
    category_id: number;
}

