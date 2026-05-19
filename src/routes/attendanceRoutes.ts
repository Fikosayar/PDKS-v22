import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { getLogs, createAttendance, updateAttendance, deleteAttendance } from '../controllers/attendanceController.js';

const router = Router();

router.get('/logs', authenticateToken as any, getLogs as any);
router.post('/', authenticateToken as any, createAttendance as any);
router.put('/:id', authenticateToken as any, updateAttendance as any);
router.delete('/:id', authenticateToken as any, deleteAttendance as any);

export default router;
