import type { Request, Response } from 'express';

export interface CqlContext {
  req: Request;
  res: Response;
}
