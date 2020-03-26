import mongoose, { Schema } from 'mongoose';

import { ITrack } from './types';

const TrackSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			unique: true
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
		]
	},
	{ timestamps: true }
);

const Track = mongoose.model<ITrack>('track', TrackSchema);

export default Track;
