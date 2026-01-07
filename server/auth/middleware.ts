import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, isTokenRevoked, type JWTPayload } from './jwt';
import { hasPermission, type Permission, type Role } from './rbac';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    
    isTokenRevoked(token).then((revoked) => {
      if (revoked) {
        res.status(401).json({ message: 'Token has been revoked' });
        return;
      }
      req.user = payload;
      next();
    }).catch(() => {
      res.status(401).json({ message: 'Invalid token' });
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requirePermission(permission: Permission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const role = req.user.userType as Role;
    if (!hasPermission(role, permission)) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    next();
  };
}

export function requireRole(...roles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.userType as Role)) {
      res.status(403).json({ message: 'Insufficient role' });
      return;
    }

    next();
  };
}

