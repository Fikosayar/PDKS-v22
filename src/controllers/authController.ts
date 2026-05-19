import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.PDKS_SYSTEM_KEY || 'default_jwt_secret_change_in_production';

export const login = async (req: Request, res: Response) => {
  const { personnelId, password } = req.body;
  if (!personnelId || !password) {
    return res.status(400).json({ error: 'Geçersiz giriş' });
  }

  try {
    const userList = await db.select().from(users).where(eq(users.personnelId, personnelId)).limit(1);
    
    if (userList.length === 0) {
      return res.status(401).json({ error: 'Hatalı ID veya şifre' });
    }
    
    const user = userList[0];

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Hatalı ID veya şifre' });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ error: 'Hesap devre dışı' });
    }

    const token = jwt.sign(
      { uid: user.id, role: user.role, companyId: user.companyId },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    const { passwordHash, ...safeUser } = user;
    return res.json({ success: true, uid: user.id, customToken: token, ...safeUser });
  } catch (error: any) {
    console.error('[Login Error]', error);
    return res.status(500).json({ error: 'Sistem hatası' });
  }
};
