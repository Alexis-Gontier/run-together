export type Run = {
    id: string;
    userId: string | null;
    date: Date;
    distance: number;
    duration: number;
    elevation: number | null;
    location: string | null;
    notes: string | null;
};