import { type Request, type Response } from "express";
import { syncService } from "./sync.service.js";

export class SyncController {
  async syncData(req: Request, res: Response): Promise<void> {
    try {
      const { lastSyncTimestamp, data } = req.body;
      const result = await syncService.syncData(lastSyncTimestamp, data);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: "Sync failed" });
    }
  }

  async getConflicts(req: Request, res: Response): Promise<void> {
    try {
      const conflicts = await syncService.getConflicts();
      res.status(200).json({ conflicts });
    } catch (error) {
      res.status(500).json({ error: "Failed to get conflicts" });
    }
  }

  async resolveConflict(req: Request, res: Response): Promise<void> {
    try {
      const { conflictId, resolution } = req.body;
      const result = await syncService.resolveConflict(conflictId, resolution);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to resolve conflict" });
    }
  }
}

export const syncController = new SyncController();
