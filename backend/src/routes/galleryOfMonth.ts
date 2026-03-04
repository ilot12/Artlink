import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// 이달의 갤러리 목록 조회 (공개, 만료되지 않은 것만)
router.get('/', async (_req, res, next) => {
  try {
    // 만료된 항목 자동 삭제
    await prisma.galleryOfMonth.deleteMany({
      where: { expiresAt: { lt: new Date() } }
    });

    const galleries = await prisma.galleryOfMonth.findMany({
      include: {
        gallery: {
          include: { images: { orderBy: { order: 'asc' }, take: 1 } }
        }
      }
    });
    res.json(galleries);
  } catch (error) { next(error); }
});

// 이달의 갤러리 등록 (Admin 전용)
router.post('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { galleryId, expiresAt } = req.body;
    const entry = await prisma.galleryOfMonth.create({
      data: { galleryId, expiresAt: new Date(expiresAt) },
      include: { gallery: true }
    });
    res.status(201).json(entry);
  } catch (error) { next(error); }
});

// 이달의 갤러리 삭제 (Admin 전용)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    await prisma.galleryOfMonth.delete({ where: { id: parseInt(req.params.id as string) } });
    res.json({ message: '삭제되었습니다.' });
  } catch (error) { next(error); }
});

export default router;
