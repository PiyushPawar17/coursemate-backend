import { Router } from 'express';

import {
	getAllTracks,
	getTrack,
	getUnapprovedTracks,
	addTrack,
	updateTrack,
	changeApprovedStatus,
	deleteTrack,
	cancelRequest
} from '../../controllers/track.controller';
import { loginCheck, adminCheck } from '../../utils/auth.utils';

const router = Router();

router
	.route('/')
	.get(getAllTracks)
	.post(loginCheck, addTrack);

router
	.route('/track/:trackId')
	.get(getTrack)
	.delete(adminCheck, deleteTrack);

router.route('/unapproved').get(adminCheck, getUnapprovedTracks);

router.route('/update/:trackId').put(adminCheck, updateTrack);

router.route('/approved-status').patch(adminCheck, changeApprovedStatus);

router.route('/cancel/:trackId').delete(loginCheck, cancelRequest);

export default router;
