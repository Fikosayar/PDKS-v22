import { Response } from 'express';
import { db } from '../db/index.js';
import { attendanceLogs, companySettings } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { CustomRequest } from '../middlewares/auth.js';

export const getLogs = async (req: CustomRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(400).json({ error: 'Şirket bulunamadı' });

    const logs = await db
      .select()
      .from(attendanceLogs)
      .where(eq(attendanceLogs.companyId, companyId))
      .orderBy(desc(attendanceLogs.timestamp));
      
    return res.json(logs);
  } catch (error) {
    return res.status(500).json({ error: 'Sistem hatası' });
  }
};

export const createAttendance = async (req: CustomRequest, res: Response) => {
  try {
    const { type, isRemote, remoteNote, latitude, longitude } = req.body;
    
    // IP Extraction (Trust proxy is enabled in express)
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress || 'unknown';

    // Office IP Control (Backend Security layer)
    const settings = await db
      .select()
      .from(companySettings)
      .where(eq(companySettings.companyId, req.user!.companyId))
      .limit(1);

    const officeIp = settings[0]?.officeIp;

    if (!isRemote && officeIp) {
      // Clean IPs for comparison (e.g., removing IPv6 mapping prefix ::ffff:)
      const cleanClientIp = clientIp.replace(/^.*:/, '');
      const cleanOfficeIp = officeIp.replace(/^.*:/, '');
      
      if (cleanClientIp !== cleanOfficeIp) {
        return res.status(403).json({ 
          error: 'Güvenlik İhlali: Ofis ağında değilsiniz.',
          details: `Beklenen IP: ${officeIp}, Sizin IP'niz: ${clientIp}`
        });
      }
    }

    await db.insert(attendanceLogs).values({
      companyId: req.user!.companyId,
      userId: req.user!.uid,
      type,
      ipAddress: clientIp,
      status: 'success',
      isRemote: !!isRemote,
      remoteNote,
      latitude,
      longitude
    });

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Sistem hatası' });
  }
};

export const deleteAttendance = async (req: CustomRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin' && req.user!.role !== 'superadmin') {
      return res.status(403).json({ error: 'Yetkisiz' });
    }
    await db.delete(attendanceLogs).where(eq(attendanceLogs.id, req.params.id));
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: 'Sistem hatası' });
  }
};

export const updateAttendance = async (req: CustomRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin' && req.user!.role !== 'superadmin') {
      return res.status(403).json({ error: 'Yetkisiz' });
    }
    await db.update(attendanceLogs).set(req.body).where(eq(attendanceLogs.id, req.params.id));
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: 'Sistem hatası' });
  }
};
