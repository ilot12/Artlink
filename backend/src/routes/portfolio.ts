import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// 내 포트폴리오 조회
router.get('/', authenticate, authorize('ARTIST'), async (req, res, next) => {
  try {
    let portfolio = await prisma.portfolio.findUnique({
      where: { userId: req.user!.id },
      include: { images: { orderBy: { order: 'asc' } } }
    });
    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: { userId: req.user!.id },
        include: { images: { orderBy: { order: 'asc' } } }
      });
    }
    res.json(portfolio);
  } catch (error) { next(error); }
});

// 포트폴리오 수정
router.put('/', authenticate, authorize('ARTIST'), async (req, res, next) => {
  try {
    const { biography, exhibitionHistory } = req.body;
    const portfolio = await prisma.portfolio.upsert({
      where: { userId: req.user!.id },
      update: { biography, exhibitionHistory },
      create: { userId: req.user!.id, biography, exhibitionHistory },
      include: { images: { orderBy: { order: 'asc' } } }
    });
    res.json(portfolio);
  } catch (error) { next(error); }
});

// 포트폴리오 이미지 추가 (최대 30장)
router.post('/images', authenticate, authorize('ARTIST'), async (req, res, next) => {
  try {
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: req.user!.id },
      include: { images: true }
    });
    if (!portfolio) {
      throw new AppError('포트폴리오를 먼저 생성해주세요.', 400);
    }
    if (portfolio.images.length >= 30) {
      throw new AppError('작품 사진은 최대 30장까지 등록 가능합니다.', 400);
    }

    const { url } = req.body;
    const image = await prisma.portfolioImage.create({
      data: {
        url,
        portfolioId: portfolio.id,
        order: portfolio.images.length
      }
    });
    res.status(201).json(image);
  } catch (error) { next(error); }
});

// 포트폴리오 이미지 삭제
router.delete('/images/:imageId', authenticate, authorize('ARTIST'), async (req, res, next) => {
  try {
    await prisma.portfolioImage.delete({
      where: { id: parseInt(req.params.imageId as string) }
    });
    res.json({ message: '삭제되었습니다.' });
  } catch (error) { next(error); }
});

export default router;
