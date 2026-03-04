import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// 히어로 슬라이드 목록 조회 (공개)
router.get('/', async (_req, res, next) => {
  try {
    const slides = await prisma.heroSlide.findMany({ orderBy: { order: 'asc' } });
    res.json(slides);
  } catch (error) { next(error); }
});

// 히어로 슬라이드 생성 (Admin 전용)
router.post('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { title, description, imageUrl, linkUrl, order } = req.body;
    const slide = await prisma.heroSlide.create({
      data: { title, description, imageUrl, linkUrl, order: order || 0 }
    });
    res.status(201).json(slide);
  } catch (error) { next(error); }
});

// 히어로 슬라이드 수정 (Admin 전용)
router.patch('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const slide = await prisma.heroSlide.update({
      where: { id: parseInt(req.params.id as string) },
      data: req.body
    });
    res.json(slide);
  } catch (error) { next(error); }
});

// 히어로 슬라이드 삭제 (Admin 전용)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    await prisma.heroSlide.delete({ where: { id: parseInt(req.params.id as string) } });
    res.json({ message: '삭제되었습니다.' });
  } catch (error) { next(error); }
});

export default router;
