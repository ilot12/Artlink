import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// 갤러리 리뷰 목록 조회
router.get('/gallery/:galleryId', async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { galleryId: parseInt(req.params.galleryId) },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) { next(error); }
});

// 내 리뷰 목록 조회
router.get('/my', authenticate, async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { userId: req.user!.id },
      include: { gallery: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) { next(error); }
});

// 리뷰 작성 (Artist 전용)
router.post('/', authenticate, authorize('ARTIST'), async (req, res, next) => {
  try {
    const { galleryId, rating, content, imageUrl, anonymous } = req.body;

    const review = await prisma.review.create({
      data: {
        userId: req.user!.id,
        galleryId,
        rating,
        content,
        imageUrl,
        anonymous: anonymous || false
      }
    });

    // 갤러리 평균 별점 업데이트
    const agg = await prisma.review.aggregate({
      where: { galleryId },
      _avg: { rating: true },
      _count: { rating: true }
    });
    await prisma.gallery.update({
      where: { id: galleryId },
      data: { rating: agg._avg.rating || 0, reviewCount: agg._count.rating }
    });

    res.status(201).json(review);
  } catch (error) { next(error); }
});

// 리뷰 수정 (작성자 본인만)
router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: parseInt(req.params.id as string) } });
    if (!review) throw new AppError('리뷰를 찾을 수 없습니다.', 404);
    if (review.userId !== req.user!.id) throw new AppError('본인 리뷰만 수정할 수 있습니다.', 403);

    const { rating, content, imageUrl, anonymous } = req.body;
    const updated = await prisma.review.update({
      where: { id: review.id },
      data: {
        ...(rating !== undefined && { rating }),
        ...(content !== undefined && { content }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(anonymous !== undefined && { anonymous }),
      }
    });

    // 갤러리 평균 별점 재계산
    if (rating !== undefined) {
      const agg = await prisma.review.aggregate({
        where: { galleryId: review.galleryId },
        _avg: { rating: true },
        _count: { rating: true }
      });
      await prisma.gallery.update({
        where: { id: review.galleryId },
        data: { rating: agg._avg.rating || 0, reviewCount: agg._count.rating }
      });
    }

    res.json(updated);
  } catch (error) { next(error); }
});

// 리뷰 삭제 (Admin 또는 작성자 본인)
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: parseInt(req.params.id as string) } });
    if (!review) throw new AppError('리뷰를 찾을 수 없습니다.', 404);

    // Admin 또는 작성자만 삭제 가능
    if (req.user!.role !== 'ADMIN' && review.userId !== req.user!.id) {
      throw new AppError('권한이 없습니다.', 403);
    }

    await prisma.review.delete({ where: { id: review.id } });

    // 갤러리 평균 별점 재계산
    const agg = await prisma.review.aggregate({
      where: { galleryId: review.galleryId },
      _avg: { rating: true },
      _count: { rating: true }
    });
    await prisma.gallery.update({
      where: { id: review.galleryId },
      data: { rating: agg._avg.rating || 0, reviewCount: agg._count.rating }
    });

    res.json({ message: '리뷰가 삭제되었습니다.' });
  } catch (error) { next(error); }
});

export default router;
