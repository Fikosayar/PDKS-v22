import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js';

const router = Router();

// Define user routes
router.get('/', authenticateToken as any, getUsers as any);
router.post('/', authenticateToken as any, createUser as any);
// avatar update with multer
router.post('/update', authenticateToken as any, upload.single('avatar'), updateUser as any);
router.delete('/:id', authenticateToken as any, deleteUser as any);

export default router;
