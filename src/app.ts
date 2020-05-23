import 'reflect-metadata';
import 'dotenv/config';

import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';

import { getRepository, QueryFailedError } from 'typeorm';

import routes from './routes';
import AppError from './errors/AppError';

import createConnection from './database';
import Category from './models/Category';

createConnection();
const app = express();

app.use(express.json());
app.use(routes);

app.get('/categories', async (req, res) => {
  const categoriesRepository = getRepository(Category);

  const categories = await categoriesRepository.find();

  return res.json(categories);
});

app.use((err: Error, request: Request, response: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  if (err instanceof QueryFailedError) {
    return response.status(400).json({
      status: 'error',
      message: err.message,
    });
  }

  console.error(err);

  return response.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

export default app;
