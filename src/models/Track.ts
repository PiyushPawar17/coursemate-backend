import mongoose, { Schema } from 'mongoose';

import { ITrack } from './types';

import { slugifyTrack } from '../utils/utils';

const TrackSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true
		},
		slug: {
			type: String,
			trim: true,
			lowercase: true,
			unique: true,
			sparse: true
		},
		description: {
			type: String,
			required: true,
			trim: true
		},
		tutorials: [
			{
				type: mongoose.Types.ObjectId,
				ref: 'tutorial'
			}
		],
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

TrackSchema.pre('save', function(next) {
	const tag = this as ITrack;

	// Converts spaces into '-' and few punctuations into characters
	if (tag.isModified('name')) {
		tag.slug = slugifyTrack(tag.name);
	}

	this.validate();

	next();
});

const Track = mongoose.model<ITrack>('track', TrackSchema);

export default Track;
