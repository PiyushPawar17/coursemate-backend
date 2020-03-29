import mongoose from 'mongoose';

const userOneId = new mongoose.Types.ObjectId();
const userTwoId = new mongoose.Types.ObjectId();

const tagOneId = new mongoose.Types.ObjectId();
const tagTwoId = new mongoose.Types.ObjectId();
const tagThreeId = new mongoose.Types.ObjectId();

const tutorialOneId = new mongoose.Types.ObjectId();
const tutorialTwoId = new mongoose.Types.ObjectId();
const tutorialThreeId = new mongoose.Types.ObjectId();

// User Data
export const users = [
	{
		_id: userOneId,
		email: 'user1@example.com',
		name: 'User1',
		displayPicture: '',
		googleID: '11223344',
		isAdmin: true,
		isSuperAdmin: false
	},
	{
		_id: userTwoId,
		email: 'user2@example.com',
		name: 'User2',
		displayPicture: '',
		googleID: '55667788',
		isAdmin: false,
		isSuperAdmin: false
	}
];

// Tags Data
export const tags = [
	{
		_id: tagOneId,
		name: 'Express',
		isApproved: true
	},
	{
		_id: tagTwoId,
		name: 'Machine Learning',
		isApproved: false
	},
	{
		_id: tagThreeId,
		name: 'C++',
		isApproved: false
	}
];

// Tutorial Data
export const tutorials = [
	{
		_id: tutorialOneId,
		title: 'Modern React with Redux',
		link: 'https://www.udemy.com/react-redux',
		tags: [tagOneId],
		educator: 'Stephen Grider',
		medium: 'Video',
		typeOfTutorial: 'Paid',
		skillLevel: 'Beginner',
		upvotes: [],
		submittedBy: {
			name: users[0].name,
			userId: users[0]._id
		},
		comments: [
			{
				_id: new mongoose.Types.ObjectId(),
				comment: 'Comment 1',
				commentedBy: users[0].name,
				userId: userOneId
			},
			{
				_id: new mongoose.Types.ObjectId(),
				comment: 'Comment 2',
				commentedBy: users[1].name,
				userId: userTwoId
			}
		],
		isApproved: false
	},
	{
		_id: tutorialTwoId,
		title: 'Advanced React and Redux: 2018 Edition',
		link: 'https://www.udemy.com/react-redux-tutorial',
		tags: [tagThreeId, tagOneId],
		educator: 'Stephen Grider',
		medium: 'Video',
		typeOfTutorial: 'Paid',
		skillLevel: 'Intermediate',
		upvotes: [userOneId, userTwoId],
		submittedBy: {
			name: users[1].name,
			userId: users[1]._id
		},
		comments: [
			{
				_id: new mongoose.Types.ObjectId(),
				comment: 'Test Comment',
				commentedBy: users[0].name,
				userId: userOneId
			}
		],
		isApproved: true
	},
	{
		_id: tutorialThreeId,
		title: 'Four Ways To Style React Components',
		link: 'https://codeburst.io/4-four-ways-to-style-react-components-ac6f323da822',
		tags: [tagTwoId],
		educator: 'Agata Krzywda',
		medium: 'Blog',
		typeOfTutorial: 'Free',
		skillLevel: 'Advanced',
		upvotes: [userTwoId],
		submittedBy: {
			name: users[1].name,
			userId: users[1]._id
		},
		comments: [
			{
				_id: new mongoose.Types.ObjectId(),
				comment: 'Test Comment',
				commentedBy: users[1].name,
				userId: userTwoId
			}
		],
		isApproved: false
	}
];
