export type Task = {
    id: number;
    title: string;
    description?: string;
    due: Date;
    status: number
    category_id: number;
}

