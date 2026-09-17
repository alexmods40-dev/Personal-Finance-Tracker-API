import express, { Response, Request } from 'express'
import { prisma } from '../index.js'
import { createUserTransaction, querySchema, validateBody } from '../validation/validations.js'




const router = express.Router();

router.post('/', validateBody(createUserTransaction), async (req: Request, res: Response) => {
    const { sum, type, category, description, date } = req.body;
    const user = req.user;
    if (!user) return res.sendStatus(401);
    try {
        const foundUser = await prisma.user.findUnique({where: {username: user}});
        if (!foundUser) return res.sendStatus(401);

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const transactions = await prisma.transaction.findMany({
            where: {
                userId: foundUser.id,
                category: category,
                type: 'EXPENSE',
                date: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            }
        });

        const foundCategory = await prisma.category.findFirst({where: {userId: foundUser.id, name: category}});
        if(!foundCategory) return res.sendStatus(404);
        const totalTransactiosMonth = transactions.reduce<any>((acc, transaction) => {
            acc += transaction.sum || 0;
            return acc;
        }, 0);

        
        const createdTransaction = await prisma.transaction.create({data: {
            userId: foundUser.id,
            sum: sum,
            type: type,
            category: category,
            description: description,
            date: date
        }});

        const newTotal = totalTransactiosMonth + sum;
        if (newTotal > foundCategory.monthLimit) {
            const exceededBy = newTotal - foundCategory.monthLimit;
            res.status(201).json({message: `Transaction created: ${createdTransaction.category}, ${createdTransaction.sum}, ${createdTransaction.type}`, warning: `You exceeded the limit for ${foundCategory.name} by ${exceededBy}`});
        } else {
            res.status(201).json({message: `Transaction created: ${createdTransaction.category}, ${createdTransaction.sum}, ${createdTransaction.type}`});
        }
    } catch (error: unknown) {
        res.sendStatus(500);
    }
});

router.get('/', async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) return res.sendStatus(401);
    const validation = querySchema.safeParse(req.query);
    if (!validation.success) return res.status(400).json({ message: "Invalid date format", errors: validation.error.format() });
    const { from, to } = validation.data;
    if (to < from) return res.status(400).json({ message: "The end date cannot be before the start date!" });
    try {
        const endOfDayTo = new Date(to);
        endOfDayTo.setUTCHours(23, 59, 59, 999);
        const transactions = await prisma.transaction.findMany({
            where: {
                user: { username: user },
                date: {
                    gte: from,
                    lte: endOfDayTo, 
                },
            },
            orderBy: {
                date: 'desc',
            }
        });
        res.status(200).json(transactions);
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
        const deletedTransaction = await prisma.transaction.delete({where: {userId: foundUser.id, id: categoryId}});
        res.status(200).json({message: `Transaction: ${deletedTransaction.category}, Sum: ${deletedTransaction.sum}  deleted!`});
    } catch (error: unknown) {
        if ((error as any).code === 'P2025') {
            res.sendStatus(404)
        } else {
            res.sendStatus(500);
        }
    }
});


export default router;