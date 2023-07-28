import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import supertest from 'supertest';
import { app } from '../src/app';

describe('transactions routes', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be able create a new transaction successfully', async () => {
    const response = await supertest(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 3000,
        type: 'debit',
      })
      .expect(201);

    expect(response.statusCode).toEqual(201);
  });
});
