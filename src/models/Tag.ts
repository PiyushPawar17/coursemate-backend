import mongoose, { Schema } from 'mongoose';

import { ITag } from './types';

import { slugifyTag } from '../utils/utils';

const TagSchema = new Schema(
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
		isApproved: {
			type: Boolean,
			default: false
		},
		submittedBy: {
			type: mongoose.Types.ObjectId,
			ref: 'user'
		}
	},
	{ timestamps: true }
);

TagSchema.pre('save', function(next) {
	const tag = this as ITag;

	// Converts spaces into '-' and few punctuations into characters
	if (tag.isModified('name')) {
		tag.slug = slugifyTag(tag.name);
	}

	this.validate();

	next();
});

const Tag = mongoose.model<ITag>('tag', TagSchema);

export default Tag;
