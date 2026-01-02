// Task-related types
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface TaskFormData {
  title: string;
  description?: string;
  status: TaskStatus;
  assignedTo?: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  assignedTo?: string;
  search?: string;
}

