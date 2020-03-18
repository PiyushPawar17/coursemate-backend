import { Router } from 'express';

import { addTag } from '../../controllers/tag.controller';

const router = Router();

router.route('/').post(addTag);

export default router;
