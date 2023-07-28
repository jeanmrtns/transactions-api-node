import fastify from 'fastify';
import cookies from '@fastify/cookie';
import { env } from './env';
import { transactionsRoutes } from './routes/transactions';

const app = fastify();

app.register(cookies);
app.register(transactionsRoutes, {
  prefix: 'transactions',
});

app
  .listen({
    port: env.PORT,
  })
  .then(() => console.log(`Server is running on port ${env.PORT} 🚀`));
