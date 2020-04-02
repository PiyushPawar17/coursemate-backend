import mongoose, { Schema } from 'mongoose';

import { IFeedback } from './types';

const FeedbackSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true
		},
		message: {
			type: String,
			required: true,
			trim: true
		},
		isRead: {
			type: Boolean,
			default: false
		},
		submittedBy: {
			type: {
				name: { type: String, required: true },
				userId: { type: mongoose.Types.ObjectId, ref: 'user' }
			},
			required: true
		}
	},
	{ timestamps: true }
);

const Feedback = mongoose.model<IFeedback>('feedback', FeedbackSchema);

export default Feedback;
