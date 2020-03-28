import { Router } from 'express';

import {
	getAllTags,
	getUnapprovedTags,
	addTag,
	updateTag,
	changeApprovedStatus,
	deleteTag
} from '../../controllers/tag.controller';
import { loginCheck, adminCheck } from '../../utils/auth.utils';

const router = Router();

router
	.route('/')
	.get(getAllTags)
	.post(loginCheck, addTag);

router.route('/unapproved').get(adminCheck, getUnapprovedTags);

router.route('/update').put(adminCheck, updateTag);

router.route('/approved-status').patch(adminCheck, changeApprovedStatus);

router.route('/:tagId').delete(adminCheck, deleteTag);

export default router;
