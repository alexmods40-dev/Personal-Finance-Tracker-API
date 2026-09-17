import express, {Request, Response} from 'express'
import { prisma } from '../index.js'

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) return res.sendStatus(401);
    try {

        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        let obj: Record<string, Record<string, number>> = {};
        const year = new Date().getFullYear();;
        const allTransactions = await prisma.transaction.findMany({
            where: {
                user: { username: user },
                type: 'EXPENSE',
                date: {
                    gte: new Date(year, 0, 1),
                    lt: new Date(year + 1, 0, 1)
                    }
                }
            });

            months.forEach((monthName, i) => {
                const monthTransactions = allTransactions.filter(transaction => {
                const transactionDate = new Date(transaction.date);
                return transactionDate.getMonth() === i;
            });

            const total = monthTransactions.reduce<Record<string, number>>((acc, transaction) => {
                acc[transaction.category] = (acc[transaction.category] || 0) + transaction.sum;
                return acc;
            }, {});

            obj[monthName] = total;
        });
        res.status(200).json(obj);
    } catch (error: unknown) {
        res.sendStatus(500);
    }
});


export default router;