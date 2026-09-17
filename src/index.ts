import express from 'express'
import { PrismaClient } from '../prisma/generated/prisma/client.js'
import { config } from 'dotenv'
import register from './routes/register.js'
import login from './routes/login.js'
import refresh from './routes/refresh.js'
import category from './routes/categories.js'
import transactions from './routes/transactions.js'
import balance from './routes/balance.js'
import stats from './routes/stats.js'
import { verifyJWT } from './middleware/verifyJWT.js'
import { rateLimit } from 'express-rate-limit'


config();
const limiter = rateLimit({
	windowMs: 5 * 60 * 1000,
	limit: 10,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
	ipv6Subnet: 56,
});

export const prisma = new PrismaClient();
const app = express();
app.use(express.json());
const port = 3000;

app.use(limiter);
app.use('/register', register);
app.use('/login', login);
app.use('/refresh', refresh);

app.use(verifyJWT);

app.use('/category', category);
app.use('/transactions', transactions);
app.use('/balance', balance);
app.use('/stats', stats);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
