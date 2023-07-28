import fastify from 'fastify';
import cookies from '@fastify/cookie';
import { transactionsRoutes } from './routes/transactions';

export const app = fastify();

app.register(cookies);
app.register(transactionsRoutes, {
  prefix: 'transactions',
});
