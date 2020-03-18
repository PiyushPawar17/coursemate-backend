import mongoose, { Schema } from 'mongoose';

import { IUser } from './types';

const UserSchema = new Schema({
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
			type: Schema.Types.ObjectId,
			ref: 'tutorial'
		}
	],
	favorites: [
		{
			type: Schema.Types.ObjectId,
			ref: 'tutorial'
		}
	],
	notifications: [
		{
			message: { type: String, required: true },
			redirectLink: { type: String },
			isRead: { type: Boolean, default: false },
			time: { type: Date, default: Date.now() }
		}
	],
	tracks: [
		{
			trackId: { type: Schema.Types.ObjectId, ref: 'track' },
			trackProgressIndex: { type: Number, default: 0 }
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
});

const User = mongoose.model<IUser>('user', UserSchema);

export default User;
