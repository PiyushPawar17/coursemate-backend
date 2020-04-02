import { Router } from 'express';

import {
	getAllFeedbacks,
	getFeedback,
	submitFeedback,
	readAllFeedbacks,
	readFeedback,
	unreadFeedback,
	deleteFeedback
} from '../../controllers/feedback.controller';
import { loginCheck, superAdminCheck } from '../../utils/auth.utils';

const router = Router();

router
	.route('/')
	.get(superAdminCheck, getAllFeedbacks)
	.post(loginCheck, submitFeedback);

router
	.route('/:feedbackId')
	.get(superAdminCheck, getFeedback)
	.delete(superAdminCheck, deleteFeedback);

router.route('/read').patch(superAdminCheck, readAllFeedbacks);

router.route('/read/:feedbackId').patch(superAdminCheck, readFeedback);

router.route('/unread/:feedbackId').patch(superAdminCheck, unreadFeedback);

export default router;
