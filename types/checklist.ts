export type ChecklistItem = { id: string; title: string; description?: string };
export type ChecklistCategory = { id: string; title: string; description?: string; items: ChecklistItem[] };
export type ProjectInfo = { projectName: string; reviewer: string; version: string; reviewDate: string };
