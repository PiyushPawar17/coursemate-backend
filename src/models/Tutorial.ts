import mongoose, { Schema } from 'mongoose';

import { ITutorial } from './types';

import { slugifyTutorial } from '../utils/utils';

const TutorialSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true
		},
		link: {
			type: String,
			required: true,
			trim: true,
			unique: true
		},
		slug: {
			type: String,
			trim: true,
			lowercase: true
		},
		tags: {
			type: [{ type: mongoose.Types.ObjectId, ref: 'tag' }],
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
		upvotes: [mongoose.Types.ObjectId],
		submittedBy: {
			type: {
				name: { type: String, required: true },
				userId: { type: mongoose.Types.ObjectId, ref: 'user' }
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
	},
	{ timestamps: true }
);

TutorialSchema.pre('save', function(next) {
	const tutorial = this as ITutorial;

	// Converts spaces into '-' and few punctuations into characters
	// and removes remaining punctuations. Adds a random string at the end
	// to make a unique url
	if (tutorial.isModified('title')) {
		tutorial.slug = slugifyTutorial(tutorial.title);
	}

	this.validate();

	next();
});

const Tutorial = mongoose.model<ITutorial>('tutorial', TutorialSchema);

export default Tutorial;
