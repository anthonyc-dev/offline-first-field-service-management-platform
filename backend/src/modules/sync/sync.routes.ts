import { Router } from 'express';
import { syncController } from './sync.controller.js';

const router = Router();

router.post('/data', (req, res) => syncController.syncData(req, res));
router.get('/conflicts', (req, res) => syncController.getConflicts(req, res));
router.post('/conflicts/resolve', (req, res) => syncController.resolveConflict(req, res));

export default router;

