import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import supertest from 'supertest';
import { app } from '../src/app';
import { execSync } from 'child_process';

describe('transactions routes', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
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

  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await supertest(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 3000,
        type: 'debit',
      });

    const cookies = createTransactionResponse.get('Set-Cookie');
    const listTransactionsResponse = await supertest(app.server)
      .get('/transactions')
      .set('Cookie', cookies);

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New transaction',
        amount: -3000, // type = debit, so the amount is negative
      }),
    ]);
  });

  it('should be able to get a specific transaction', async () => {
    const createTransactionResponse = await supertest(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 3000,
        type: 'debit',
      });

    const cookies = createTransactionResponse.get('Set-Cookie');
    const listTransactionsResponse = await supertest(app.server)
      .get('/transactions')
      .set('Cookie', cookies);

    const transactionId = listTransactionsResponse.body.transactions[0].id;
    const getTransactionResponse = await supertest(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies);

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        id: transactionId,
      }),
    );
  });

  it('should be able to get the summary', async () => {
    const createCreditTransactionResponse = await supertest(app.server)
      .post('/transactions')
      .send({
        title: 'Credit transaction',
        amount: 3000,
        type: 'credit',
      });
    const cookies = createCreditTransactionResponse.get('Set-Cookie');
    await supertest(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'Credit transaction',
        amount: 2000,
        type: 'debit',
      });

    const getSummaryResponse = await supertest(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies);
    expect(getSummaryResponse.body.summary).toEqual({
      amount: 1000,
    });
  });
});
