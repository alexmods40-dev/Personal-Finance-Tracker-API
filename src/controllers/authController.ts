import { Request, Response } from 'express'
import { prisma } from '../index.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto';

export const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');
export async function handleLogin(req: Request, res: Response) {
    const { username, password } = req.body;
    const foundUser = await prisma.user.findUnique({where: {username: username}});
    if(!foundUser) return res.sendStatus(401);
    const match = await bcrypt.compare(password, foundUser.password);
    if (match) {
        const accessToken = jwt.sign(
            { username: foundUser.username },
            process.env.ACCESS_TOKEN!,
            { expiresIn: '15m' }
        );
        const refreshToken = jwt.sign(
            { username: foundUser.username },
            process.env.REFRESH_TOKEN!,
            { expiresIn: '1d' }
        );
        await prisma.user.update({where: {username: foundUser.username}, data: {refresh_token: hashToken(refreshToken)}});
        res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'none', secure: true, maxAge: 24 * 60 * 60 * 1000 });
        res.json({ accessToken });
    } else {
        res.sendStatus(401);
    }
}