import { FastifyInstance } from 'fastify';
import { knex } from '../infra/database/knex';
import { z } from 'zod';
import { randomUUID } from 'crypto';

export async function transactionsRoutes(app: FastifyInstance) {
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

  app.get('/', async (request, reply) => {
    const transactions = await knex('transactions').select('*');

    return reply.send(transactions);
  });
}
