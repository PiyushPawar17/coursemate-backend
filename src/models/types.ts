import mongoose, { Document } from 'mongoose';

//----- User Interface -----
export interface IUser extends Document {
	// Unique Id for the User
	_id: mongoose.Types.ObjectId;

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
	submittedTutorials?: [mongoose.Types.ObjectId];

	// List of favorite tutorials of the user
	// The list will contain ObjectIds which will refer to Tutorial Schema
	favorites?: [mongoose.Types.ObjectId];

	// List of notifications that a user got
	notifications?: [
		{
			_id: mongoose.Types.ObjectId; // Mongo Id
			message: string; // Message to be displayed
			redirectLink?: string; // Where to redirect on click
			isRead: boolean; // Is notification read by the user
			time: Date; // When the notification was sent
		}
	];

	// The learning tracks that a user had subscribed to
	tracks?: [
		{
			_id: mongoose.Types.ObjectId; // Mongo Id
			trackId: mongoose.Types.ObjectId; // ID of the subscribed track
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
	// Unique Id for the Tag
	_id: mongoose.Types.ObjectId;

	// Name of the tag
	name: string;

	// Slug of the tag
	slug: string;

	// Approved status of the tag
	// Tag will appear on the Front-end only if it is approved
	isApproved: boolean;

	// User that submitted the tag
	submittedBy: mongoose.Types.ObjectId;
}

//----- Tutorial Interface -----
export interface ITutorial extends Document {
	// Unique Id for the Tutorial
	_id: mongoose.Types.ObjectId;

	// Title of the tutorial
	title: string;

	// Link to the original tutorial
	link: string;

	// Slug of the tutorial
	slug: string;

	// Tags related to the tutorial (at most 5)
	tags: [mongoose.Types.ObjectId];

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
	upvotes?: [mongoose.Types.ObjectId];

	// List of comments on the tutorial
	comments?: [
		{
			_id: mongoose.Types.ObjectId; // Mongo Id
			comment: string; // Comment on the tutorial
			commentedBy: string; // Name of the user
			userId: mongoose.Types.ObjectId; // ObjectId of the user
		}
	];

	// User that submitted the tutorial
	submittedBy: {
		name: string; // Name of the user
		userId: mongoose.Types.ObjectId; // ObjectId of the user
	};

	// Time when submitted
	submittedOn: Date;

	// Approved status of the tutorial
	// Tutorial will appear on the Front-end only if it is approved
	isApproved: boolean;
}

//----- Track Interface -----
export interface ITrack extends Document {
	// Unique Id for the Track
	_id: mongoose.Types.ObjectId;

	// Name of the track
	name: string;

	// Short description about the track
	description: string;

	// Tutorials in the track to follow
	tutorials: [mongoose.Types.ObjectId];
}

//----- Feedback Interface -----
export interface IFeedback extends Document {
	// Unique Id for the Feedback
	_id: mongoose.Types.ObjectId;

	// Name of the user that gave the feedback
	name: string;

	// Title of the feedback
	title: string;

	// Feedback message
	message: string;

	// Is feedback read
	isRead: boolean;
}
