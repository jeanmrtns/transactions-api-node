import fastify from 'fastify';
import cookies from '@fastify/cookie';
import { transactionsRoutes } from './routes/transactions';

export const app = fastify();

app.register(cookies);
app.addHook('preHandler', (request) => {
  console.log(`[${request.method}]: ${request.url}`);
});
app.register(transactionsRoutes, {
  prefix: 'transactions',
});
