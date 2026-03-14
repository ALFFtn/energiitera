import type { Request, Response, NextFunction } from 'express';
export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
export declare const authenticate: (req: Request, _res: Response, next: NextFunction) => void;
export declare const authorize: (...roles: string[]) => (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map