import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { CustomRequest } from '../middlewares/auth.js';

export const getUsers = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user!.companyId && req.user!.role !== 'superadmin') {
      return res.status(400).json({ error: 'Şirket bulunamadı' });
    }
    const query = req.user!.role === 'superadmin'
      ? db.select().from(users)
      : db.select().from(users).where(eq(users.companyId, req.user!.companyId));
      
    const allUsers = await query;
    const safeUsers = allUsers.map(u => { const { passwordHash, ...safe } = u; return safe; });
    return res.json(safeUsers);
  } catch (error) {
    return res.status(500).json({ error: 'Sistem hatası' });
  }
};

export const createUser = async (req: CustomRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin' && req.user!.role !== 'superadmin') {
      return res.status(403).json({ error: 'Yetkisiz' });
    }
    const { newUser } = req.body;
    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    
    let parsedManagerId = (newUser.managerId === 'superadmin' || newUser.managerId === 'admin_initial' || newUser.managerId === '') ? null : newUser.managerId;
    let parsedStartDate = newUser.startDate === '' ? null : new Date(newUser.startDate);
    let parsedLeaveBalance = newUser.leaveBalance === '' ? 0 : parseFloat(newUser.leaveBalance);

    const userList = await db.insert(users).values({
      companyId: req.user!.companyId,
      personnelId: newUser.personnelId,
      name: newUser.name,
      title: newUser.title,
      role: newUser.role,
      managerId: parsedManagerId,
      leaveBalance: parsedLeaveBalance,
      startDate: parsedStartDate,
      passwordHash: hashedPassword,
      canRemoteCheckIn: newUser.canRemoteCheckIn,
      allowedDevice: newUser.allowedDevice,
    }).returning();
    
    return res.json({ success: true, user: userList[0] });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: 'Sistem hatası' });
  }
};

export const updateUser = async (req: CustomRequest, res: Response) => {
  try {
    const { targetUid } = req.body;
    let updates = req.body.updates;
    
    // If sent as FormData (due to file upload), parse updates
    if (typeof updates === 'string') {
      updates = JSON.parse(updates);
    } else if (!updates && req.body) {
      // Direct form data parsing fallback
      updates = { ...req.body };
      delete updates.targetUid;
    }

    if (updates.managerId === 'superadmin' || updates.managerId === 'admin_initial' || updates.managerId === '') updates.managerId = null;
    if (updates.leaveBalance === '') updates.leaveBalance = 0;
    if (updates.startDate === '') updates.startDate = null;

    // Handle File Upload (Multer)
    if (req.file) {
      // req.file.path contains absolute path, we store relative URL
      updates.avatarUrl = `/uploads/${req.file.filename}`;
    }
    
    const isSelf = req.user!.uid === targetUid;
    const isAdmin = req.user!.role === 'admin' || req.user!.role === 'superadmin';
    if (!isSelf && !isAdmin) return res.status(403).json({ error: 'Yetkisiz' });
    
    if (updates.password) {
      updates.passwordHash = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }
    
    await db.update(users).set(updates).where(eq(users.id, targetUid));
    return res.json({ success: true, avatarUrl: updates.avatarUrl });
  } catch (e) {
    return res.status(500).json({ error: 'Sistem hatası' });
  }
};

export const deleteUser = async (req: CustomRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin' && req.user!.role !== 'superadmin') return res.status(403).json({ error: 'Yetkisiz' });
    await db.update(users).set({ isActive: false }).where(eq(users.id, req.params.id));
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: 'Sistem hatası' });
  }
};
