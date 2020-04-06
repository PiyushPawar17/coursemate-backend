import { Router } from 'express';

const router = Router();

import {
	getAllTutorials,
	getTutorial,
	getTutorialsByTag,
	getUnapprovedTutorials,
	addTutorial,
	addUpvote,
	addComment,
	updateTutorial,
	changeApprovedStatus,
	deleteTutorial,
	removeUpvote,
	removeComment,
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

router.route('/tag/:tagId').get(getTutorialsByTag);

router.route('/unapproved').get(adminCheck, getUnapprovedTutorials);

router
	.route('/upvote/:tutorialId')
	.post(loginCheck, addUpvote)
	.delete(loginCheck, removeUpvote);

router.route('/comment/:tutorialId').post(loginCheck, addComment);

router.route('/comment/:tutorialId/:commentId').delete(loginCheck, removeComment);

router.route('/update/:tutorialId').put(adminCheck, updateTutorial);

router.route('/approved-status').patch(adminCheck, changeApprovedStatus);

router.route('/cancel/:tutorialId').delete(loginCheck, cancelRequest);

export default router;
