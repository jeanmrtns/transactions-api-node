import { FastifyInstance } from 'fastify';
import { knex } from '../infra/database/knex';
import { z } from 'zod';
import { randomUUID } from 'crypto';

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const transactions = await knex('transactions').select('*');

    return {
      transactions,
    };
  });

  app.get('/:id', async (request) => {
    const requestParamsSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = requestParamsSchema.parse(request.params);
    const transaction = await knex('transactions')
      .where({
        id,
      })
      .first();

    return {
      transaction,
    };
  });

  app.get('/summary', async () => {
    const summary = await knex('transactions')
      .sum('amount', {
        as: 'amount',
      })
      .first();

    return { summary };
  });

  app.post('/', async (request, reply) => {
    const requestBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    });

    const { title, amount, type } = requestBodySchema.parse(request.body);

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
    });

    return reply.status(201).send();
  });
}
