import { taskRepository } from './task.repository.js';

export class TaskService {
  async getAllTasks(): Promise<any[]> {
    return await taskRepository.findAll();
  }

  async getTaskById(id: string): Promise<any | null> {
    return await taskRepository.findById(id);
  }

  async createTask(taskData: any): Promise<any> {
    return await taskRepository.create(taskData);
  }

  async updateTask(id: string, taskData: any): Promise<any | null> {
    return await taskRepository.update(id, taskData);
  }

  async deleteTask(id: string): Promise<void> {
    await taskRepository.delete(id);
  }
}

export const taskService = new TaskService();

