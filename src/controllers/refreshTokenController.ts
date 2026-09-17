import { Request, Response } from 'express'
import { prisma } from '../index.js'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser';
import { hashToken } from './authController.js'


app.use(cookieParser());
export async function handleRefreshToken (req: Request, res: Response) {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;
    const foundUser = await prisma.user.findFirst({where: { refresh_token: hashToken(refreshToken)}});
    if (!foundUser) return res.sendStatus(403);
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN!,
        (err: any, decoded: any) => {
            if (err || foundUser.username !== decoded.username) return res.sendStatus(403);
            const accessToken = jwt.sign(
                { "username": decoded.username },
                process.env.ACCESS_TOKEN!,
                { expiresIn: '15m' }
            );
            res.json({ accessToken })
        }
    );
}