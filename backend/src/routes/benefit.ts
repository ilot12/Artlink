import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// 혜택 목록 조회 (공개)
router.get('/', async (_req, res, next) => {
  try {
    const benefits = await prisma.benefit.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(benefits);
  } catch (error) { next(error); }
});

// 혜택 생성 (Admin 전용)
router.post('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const benefit = await prisma.benefit.create({ data: req.body });
    res.status(201).json(benefit);
  } catch (error) { next(error); }
});

// 혜택 수정 (Admin 전용)
router.patch('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const benefit = await prisma.benefit.update({
      where: { id: parseInt(req.params.id as string) },
      data: req.body
    });
    res.json(benefit);
  } catch (error) { next(error); }
});

// 혜택 삭제 (Admin 전용)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    await prisma.benefit.delete({ where: { id: parseInt(req.params.id as string) } });
    res.json({ message: '삭제되었습니다.' });
  } catch (error) { next(error); }
});

export default router;
