import mongoose, { Schema } from 'mongoose';

import { ITag } from './types';

const TagSchema = new Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	isApproved: {
		type: Boolean,
		default: false
	}
});

const Tag = mongoose.model<ITag>('tag', TagSchema);

export default Tag;
