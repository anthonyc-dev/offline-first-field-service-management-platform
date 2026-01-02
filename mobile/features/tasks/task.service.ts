import { taskRepository } from '@/core/db/repositories/task.repository';
import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import type { Task } from '@/core/db/repositories/task.repository';

export class TaskService {
  async getTasks(): Promise<Task[]> {
    // First try to get from local database
    const localTasks = await taskRepository.getAll();
    
    // If online, sync and get latest
    // await syncService.syncTasks();
    
    return localTasks;
  }

  async getTaskById(id: string): Promise<Task | null> {
    return await taskRepository.getById(id);
  }

  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'synced'>): Promise<Task> {
    // Create in local database first (offline-first)
    const task = await taskRepository.create({
      ...taskData,
      id: `local-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      synced: false,
    });

    // Try to sync if online
    // await syncService.syncTasks();

    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    // Update in local database first
    const task = await taskRepository.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
      synced: false,
    });

    // Try to sync if online
    // await syncService.syncTasks();

    return task;
  }

  async deleteTask(id: string): Promise<void> {
    await taskRepository.delete(id);
    // Try to sync deletion if online
  }
}

export const taskService = new TaskService();

