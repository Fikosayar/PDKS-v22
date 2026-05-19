import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request object to include user payload
export interface CustomRequest extends Request {
  user?: {
    uid: string;
    role: string;
    companyId: string;
  };
}

const JWT_SECRET = process.env.PDKS_SYSTEM_KEY || 'default_jwt_secret_change_in_production';

export const authenticateToken = (req: CustomRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Token expired or invalid' });
    req.user = user;
    next();
  });
};
