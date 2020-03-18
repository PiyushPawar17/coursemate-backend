import mongoose, { Schema } from 'mongoose';

import { ITrack } from './types';

const TrackSchema = new Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	description: {
		type: String,
		required: true,
		trim: true
	},
	tutorials: [
		{
			type: Schema.Types.ObjectId,
			ref: 'tutorial'
		}
	]
});

const Track = mongoose.model<ITrack>('track', TrackSchema);

export default Track;
