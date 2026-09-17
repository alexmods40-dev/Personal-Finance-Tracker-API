import express, { Response, Request } from 'express'
import { prisma } from '../index.js'
import { createUserCategory, validateBody } from '../validation/validations.js'

const router = express.Router();

router.post('/', validateBody(createUserCategory),  async (req: Request, res: Response) => {
    const { name, monthLimit } = req.body;
    const user = req.user;
    if (!user) return res.sendStatus(401);
    try {
    const duplicateCategory = await prisma.category.findFirst({where: {name: name, user: { username: user }}});
    if (duplicateCategory) return res.sendStatus(409);
    const foundUser = await prisma.user.findUnique({where: {username: user}});
    if (!foundUser) return res.sendStatus(401);
    await prisma.category.create({data: {
        userId: foundUser.id,
        name: name,
        monthLimit: monthLimit,
    }});
    res.sendStatus(201);
    } catch(error: unknown) {
        res.sendStatus(500);
    }
});

router.get('/', async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) return res.sendStatus(401);
    try {
        const foundUser = await prisma.user.findUnique({where: {username: user}});
        if (!foundUser) return res.sendStatus(401);
        const categories = await prisma.category.findMany({where: {userId: foundUser.id}});
        res.status(200).json(categories);
    } catch (error: unknown) {
        res.sendStatus(500);
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    const user = req.user;
    const categoryId = Number(req.params.id)
    if (!user) return res.sendStatus(401);
    try {
        const foundUser = await prisma.user.findUnique({where: {username: user}});
        if (!foundUser) return res.sendStatus(401);
        const deletedCategory = await prisma.category.delete({where: {userId: foundUser.id, id: categoryId}});
        res.status(200).json({message: `Category: ${deletedCategory.name} deleted!`});
    } catch (error: unknown) {
        res.sendStatus(500);
    }
});

export default router;