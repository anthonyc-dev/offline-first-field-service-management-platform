import { type Request, type Response } from "express";
import { taskService } from "./task.service.js";

export class TaskController {
  async getAllTasks(req: Request, res: Response): Promise<void> {
    try {
      const tasks = await taskService.getAllTasks();
      res.status(200).json({ tasks });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  }

  async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || Array.isArray(id)) {
        res.status(400).json({ error: "Task ID is required" });
        return;
      }
      const taskId: string = id;
      const task = await taskService.getTaskById(taskId);
      if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
      }
      res.status(200).json({ task });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch task" });
    }
  }

  async createTask(req: Request, res: Response): Promise<void> {
    try {
      const taskData = req.body;
      const task = await taskService.createTask(taskData);
      res.status(201).json({ task });
    } catch (error) {
      res.status(400).json({ error: "Failed to create task" });
    }
  }

  async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || Array.isArray(id)) {
        res.status(400).json({ error: "Task ID is required" });
        return;
      }
      const taskId: string = id;
      const taskData = req.body;
      const task = await taskService.updateTask(taskId, taskData);
      if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
      }
      res.status(200).json({ task });
    } catch (error) {
      res.status(400).json({ error: "Failed to update task" });
    }
  }

  async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || Array.isArray(id)) {
        res.status(400).json({ error: "Task ID is required" });
        return;
      }
      const taskId: string = id;
      await taskService.deleteTask(taskId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete task" });
    }
  }
}

export const taskController = new TaskController();
