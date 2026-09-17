import jwt, { JwtPayload } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

declare global {
    namespace Express {
        interface Request {
            user?: string;
        }
    }
}

interface CustomJwtPayload extends JwtPayload {
    username: string;
}

export function verifyJWT(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.sendStatus(401);
    const token = authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN!,
        (err, decoded) => {
            if (err) return res.sendStatus(403);
            const payload = decoded as CustomJwtPayload
            req.user = payload.username;
            next();
        }
    );
}