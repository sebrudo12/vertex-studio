import { Router } from 'express';
import { getAllProducts, getProductBySlug, getProductDocs } from '../controllers/products.controller';

const router = Router();

router.get('/', getAllProducts);
router.get('/:slug', getProductBySlug);
router.get('/:slug/docs', getProductDocs);

export default router;
