import {Router} from 'express';

import authRoutes from './auth/authRoutes';

const router = Router();

router.use('/auth', authRoutes);

export default router;