import { Request, Response, NextFunction } from 'express';

// 커스텀 에러 클래스
export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

// 글로벌 에러 핸들러
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('Error:', err.message, err.stack);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Prisma 에러 처리
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({ error: '데이터 처리 중 오류가 발생했습니다.' });
  }

  return res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
}
