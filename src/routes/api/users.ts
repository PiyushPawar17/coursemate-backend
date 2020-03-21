import { Router } from 'express';

import {
	getSubmittedTutorials,
	getFavorites,
	getNotifications,
	getTracks,
	getAllUsers
} from '../../controllers/user.controller';

const router = Router();

router.route('/submitted-tutorials').get(getSubmittedTutorials);

router.route('/favorites').get(getFavorites);

router.route('/notifications').get(getNotifications);

router.route('/tracks').get(getTracks);

router.route('/all-users').get(getAllUsers);

export default router;
