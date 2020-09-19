import { Router } from 'express';

import {
	getUser,
	getSubmittedTutorials,
	getFavorites,
	getTracks,
	getAllUsers,
	addToFavorites,
	subscribeToTrack,
	updateUser,
	updateTrackProgress,
	changeAdminStatus,
	changeSuperAdminStatus,
	removeFromFavorites,
	unsubscribeFromTrack,
	deleteUser
} from '../../controllers/user.controller';
import { loginCheck, superAdminCheck } from '../../utils/auth.utils';

const router = Router();

router.route('/').get(loginCheck, getUser);

router.route('/submitted-tutorials').get(loginCheck, getSubmittedTutorials);

router.route('/favorites').get(loginCheck, getFavorites);

router.route('/tracks').get(loginCheck, getTracks);

router.route('/all-users').get(superAdminCheck, getAllUsers);

router
	.route('/favorites/:tutorialId')
	.post(loginCheck, addToFavorites)
	.delete(loginCheck, removeFromFavorites);

router
	.route('/tracks/:trackId')
	.post(loginCheck, subscribeToTrack)
	.patch(loginCheck, updateTrackProgress)
	.delete(loginCheck, unsubscribeFromTrack);

router.route('/update').put(loginCheck, updateUser);

router.route('/admin-status').patch(superAdminCheck, changeAdminStatus);

router.route('/super-admin-status').patch(superAdminCheck, changeSuperAdminStatus);

router.route('/delete/:userId').delete(superAdminCheck, deleteUser);

export default router;
