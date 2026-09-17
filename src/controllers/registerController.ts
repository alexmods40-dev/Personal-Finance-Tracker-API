import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '../index.js'

export async function handleNewUser(req: Request, res: Response) {
    const { username, password } = req.body;
    try {
    const duplicatedUser = await prisma.user.findUnique({where: {username: username}});
    if(duplicatedUser) return res.status(409).json({message: 'User with this username alredy registred!'});
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({ data: {
            username: username,
            password: hashedPassword,
        }});
        res.status(201).json({message: 'User created!'})
    } catch(error: unknown) {
        res.status(500).json({ 'message': (error as Error).message });
    }
}