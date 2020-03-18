import { Schema, Document } from 'mongoose';

//----- User Interface -----
export interface IUser extends Document {
	// Name of the user
	name: string;

	// Unique google ID of the user
	googleID: string;

	// EmailID of the user
	email: string;

	// Profile picture stored by google
	displayPicture?: string;

	// List of tutorials submitted by the user
	// The list will contain ObjectIds which will refer to Tutorial Schema
	submittedTutorials?: [Schema.Types.ObjectId];

	// List of favorite tutorials of the user
	// The list will contain ObjectIds which will refer to Tutorial Schema
	favorites?: [Schema.Types.ObjectId];

	// List of notifications that a user got
	notifications?: [
		{
			message: string; // Message to be displayed
			redirectLink?: string; // Where to redirect on click
			isRead: boolean; // Is notification read by the user
			time: Date; // When the notification was sent
		}
	];

	// The learning tracks that a user had subscribed to
	tracks?: [
		{
			trackId: Schema.Types.ObjectId; // ID of the subscribed track
			trackProgressIndex: number; // Index of current tutorial in progress
		}
	];

	// Admin status of the user
	isAdmin: boolean;

	// Super Admin status of the user
	isSuperAdmin: boolean;
}

//----- Tag Interface -----
export interface ITag extends Document {
	// Name of the tag
	name: string;

	// Approved status of the tag
	// Tag will appear on the Front-end only if it is approved
	isApproved: boolean;
}

//----- Tutorial Interface -----
export interface ITutorial extends Document {
	// Title of the tutorial
	title: string;

	// Link to the original tutorial
	link: string;

	// Tags related to the tutorial (at most 5)
	tags: [string];

	// Name of the educator of the tutorial
	educator: string;

	// Whether the tutorial is in the form of Video or Blog
	medium: 'Video' | 'Blog';

	// Whether the tutorial is free or paid
	typeOfTutorial: 'Free' | 'Paid';

	// Expected skill level to understand the tutorial
	skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';

	// Number of upvotes tutorials got
	// Will be list of ObjectIds of the users who upvoted
	upvotes: [Schema.Types.ObjectId];

	// List of comments on the tutorial
	comments: [
		{
			comment: string; // Comment on the tutorial
			commentedBy: string; // Name of the user
			userId: Schema.Types.ObjectId; // ObjectId of the user
		}
	];

	// User that submitted the tutorial
	submittedBy: {
		name: string; // Name of the user
		userId: Schema.Types.ObjectId; // ObjectId of the user
	};

	// Time when submitted
	submittedOn: Date;

	// Approved status of the tutorial
	// Tutorial will appear on the Front-end only if it is approved
	isApproved: boolean;
}

//----- Track Interface -----
export interface ITrack extends Document {
	// Name of the track
	name: string;

	// Short description about the track
	description: string;

	// Tutorials in the track to follow
	tutorials: [Schema.Types.ObjectId];
}

//----- Feedback Interface -----
export interface IFeedback extends Document {
	// Name of the user that gave the feedback
	name: string;

	// Title of the feedback
	title: string;

	// Feedback message
	message: string;

	// Is feedback read
	isRead: boolean;
}
