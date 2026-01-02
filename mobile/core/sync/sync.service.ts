// Offline-first sync service
import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import { taskRepository } from "../db/repositories/task.repository";

export interface SyncResult {
  success: boolean;
  synced: number;
  errors: number;
}

class SyncService {
  async syncTasks(): Promise<SyncResult> {
    try {
      // Get unsynced tasks from local database
      const unsyncedTasks = await taskRepository.getUnsynced();

      let synced = 0;
      let errors = 0;

      // Sync each task
      for (const task of unsyncedTasks) {
        try {
          if (task.id.startsWith("local-")) {
            // New task - create on server
            await apiClient.post(API_ENDPOINTS.TASKS.CREATE, task);
          } else {
            // Existing task - update on server
            await apiClient.put(API_ENDPOINTS.TASKS.UPDATE(task.id), task);
          }
          // Mark as synced
          await taskRepository.markForSync(task.id);
          synced++;
        } catch (error) {
          console.error(`Failed to sync task ${task.id}:`, error);
          errors++;
        }
      }

      // Fetch latest tasks from server
      await this.pullTasks();

      return { success: true, synced, errors };
    } catch (error) {
      console.error("Sync failed:", error);
      return { success: false, synced: 0, errors: 0 };
    }
  }

  async pullTasks(): Promise<void> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TASKS.LIST);
      const tasks = response.data;

      // Update local database with server data
      for (const task of tasks) {
        await taskRepository.update(task.id, { ...task, synced: true });
      }
    } catch (error) {
      console.error("Failed to pull tasks:", error);
    }
  }

  async syncOnConnection(): Promise<void> {
    // Check network status and sync if online
    // This will be called when network connection is restored
    await this.syncTasks();
  }
}

export const syncService = new SyncService();
