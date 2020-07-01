# Models

Here you'll find the structure and information of the fields of the models used in CourseMate.

## User Model

```ts
interface User {
	// Unique Id for the User
	_id: ObjectId;

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
	submittedTutorials?: [ObjectId];

	// List of favorite tutorials of the user
	// The list will contain ObjectIds which will refer to Tutorial Schema
	favorites?: [ObjectId];

	// The learning tracks that a user had subscribed to
	tracks?: [
		{
			_id: ObjectId; // Mongo Id
			track: ObjectId; // ID of the subscribed track
			trackProgressIndex: number; // Index of current tutorial in progress
		}
	];

	// Admin status of the user
	isAdmin: boolean;

	// Super Admin status of the user
	isSuperAdmin: boolean;
}
```

## Tag Model

```ts
interface Tag {
	// Unique Id for the Tag
	_id: ObjectId;

	// Name of the tag
	name: string;

	// Slug of the tag
	slug: string;

	// Approved status of the tag
	// Tag will appear on the Front-end only if it is approved
	isApproved: boolean;

	// User that submitted the tag
	submittedBy: ObjectId;
}
```

## Tutorial Model

```ts
interface Tutorial {
	// Unique Id for the Tutorial
	_id: ObjectId;

	// Title of the tutorial
	title: string;

	// Link to the original tutorial
	link: string;

	// Slug of the tutorial
	slug: string;

	// Tags related to the tutorial (at most 5)
	tags: [ObjectId];

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
	upvotes?: [ObjectId];

	// User that submitted the tutorial
	submittedBy: {
		name: string; // Name of the user
		userId: ObjectId; // ObjectId of the user
	};

	// Time when submitted
	submittedOn: Date;

	// Approved status of the tutorial
	// Tutorial will appear on the Front-end only if it is approved
	isApproved: boolean;
}
```

## Track Model

```ts
interface Track {
	// Unique Id for the Track
	_id: ObjectId;

	// Name of the track
	name: string;

	// Slug of the track
	slug: string;

	// Short description about the track
	description: string;

	// Tutorials in the track to follow
	tutorials: [ObjectId];

	// User that submitted the track
	submittedBy: {
		name: string; // Name of the user
		userId: ObjectId; // ObjectId of the user
	};

	// Time when submitted
	submittedOn: Date;

	// Approved status of the track
	// Track will appear on the Front-end only if it is approved
	isApproved: boolean;
}
```

## Feedback Model

```ts
interface Feedback {
	// Unique Id for the Feedback
	_id: ObjectId;

	// Title of the feedback
	title: string;

	// Feedback message
	message: string;

	// Is feedback read
	isRead: boolean;

	// User that submitted the feedback
	submittedBy: {
		name: string; // Name of the user
		userId: ObjectId; // ObjectId of the user
	};
}
```
