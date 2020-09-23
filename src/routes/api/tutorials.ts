import { Router } from 'express';

const router = Router();

import {
	getAllTutorials,
	getTutorial,
	getTutorialsByTag,
	getUnapprovedTutorials,
	addTutorial,
	addUpvote,
	updateTutorial,
	changeApprovedStatus,
	deleteTutorial,
	removeUpvote,
	cancelRequest
} from '../../controllers/tutorial.controller';
import { loginCheck, adminCheck } from '../../utils/auth.utils';

router
	.route('/')
	.get(getAllTutorials)
	.post(loginCheck, addTutorial);

router
	.route('/tutorial/:tutorialId')
	.get(getTutorial)
	.delete(adminCheck, deleteTutorial);

router.route('/tag/:tag').get(getTutorialsByTag);

router.route('/unapproved').get(adminCheck, getUnapprovedTutorials);

router
	.route('/upvote/:tutorialId')
	.post(loginCheck, addUpvote)
	.delete(loginCheck, removeUpvote);

router.route('/update/:tutorialId').put(adminCheck, updateTutorial);

router.route('/approved-status').patch(adminCheck, changeApprovedStatus);

router.route('/cancel/:tutorialId').delete(loginCheck, cancelRequest);

export default router;
