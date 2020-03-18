import mongoose, { Schema } from 'mongoose';

import { ITutorial } from './types';

const TutorialSchema = new Schema({
	title: {
		type: String,
		required: true,
		trim: true
	},
	link: {
		type: String,
		required: true,
		trim: true
	},
	tags: {
		type: [String],
		required: true
	},
	educator: {
		type: String,
		required: true,
		trim: true
	},
	medium: {
		type: String,
		enum: ['Video', 'Blog'],
		required: true
	},
	typeOfTutorial: {
		type: String,
		enum: ['Free', 'Paid'],
		required: true
	},
	skillLevel: {
		type: String,
		enum: ['Beginner', 'Intermediate', 'Advanced'],
		required: true
	},
	upvotes: [Schema.Types.ObjectId],
	comments: [
		{
			comment: { type: String, required: true },
			commentedBy: { type: String, required: true },
			userId: { type: Schema.Types.ObjectId, ref: 'user' }
		}
	],
	submittedBy: {
		type: {
			name: { type: String, required: true },
			userId: { type: Schema.Types.ObjectId, ref: 'user' }
		},
		required: true
	},
	submittedOn: {
		type: Date,
		default: Date.now()
	},
	isApproved: {
		type: Boolean,
		default: false
	}
});

const Tutorial = mongoose.model<ITutorial>('tutorial', TutorialSchema);

export default Tutorial;
