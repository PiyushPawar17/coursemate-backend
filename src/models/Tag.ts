import mongoose, { Schema } from 'mongoose';

import { ITag } from './types';

const TagSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			unique: true
		},
		url: {
			type: String,
			trim: true,
			lowercase: true
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

	if (tag.isModified('name')) {
		tag.url = tag.name
			.replace(/ /g, '-')
			.replace(/#/g, '-sharp')
			.replace(/\+/g, '-plus')
			.replace(/^\./g, 'dot-')
			.replace(/\./g, '-dot-');
	}

	next();
});

const Tag = mongoose.model<ITag>('tag', TagSchema);

export default Tag;
