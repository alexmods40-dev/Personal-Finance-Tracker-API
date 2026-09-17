import express, {Request, Response} from 'express'
import { prisma } from '../index.js'

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) return res.sendStatus(401);
    try {
    const result = await prisma.transaction.groupBy({
        by: ['type'],
        where: { user: { username: user } },
        _sum: { sum: true }
    });
    const income = result.find(r => r.type === 'INCOME')?._sum.sum ?? 0;
    const expense = result.find(r => r.type === 'EXPENSE')?._sum.sum ?? 0;
    res.status(200).json({balance: income - expense});
    } catch (error: unknown) {
        res.sendStatus(500);
    }
});

export default router;