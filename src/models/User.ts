import mongoose, { Schema } from 'mongoose';

import { IUser } from './types';

const UserSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true
		},
		googleID: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true,
			trim: true
		},
		displayPicture: {
			type: String
		},
		submittedTutorials: [
			{
				type: mongoose.Types.ObjectId,
				ref: 'tutorial'
			}
		],
		favorites: [
			{
				type: mongoose.Types.ObjectId,
				ref: 'tutorial'
			}
		],
		tracks: [
			{
				track: { type: mongoose.Types.ObjectId, ref: 'track' },
				trackProgressIndex: { type: Number, default: 0, min: 0 }
			}
		],
		isAdmin: {
			type: Boolean,
			default: false
		},
		isSuperAdmin: {
			type: Boolean,
			default: false
		}
	},
	{ timestamps: true }
);

const User = mongoose.model<IUser>('user', UserSchema);

export default User;
