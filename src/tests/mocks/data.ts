import mongoose from 'mongoose';

const userOneId = new mongoose.Types.ObjectId();
const userTwoId = new mongoose.Types.ObjectId();
const userThreeId = new mongoose.Types.ObjectId();

const tagOneId = new mongoose.Types.ObjectId();
const tagTwoId = new mongoose.Types.ObjectId();
const tagThreeId = new mongoose.Types.ObjectId();

const tutorialOneId = new mongoose.Types.ObjectId();
const tutorialTwoId = new mongoose.Types.ObjectId();
const tutorialThreeId = new mongoose.Types.ObjectId();

const trackOneId = new mongoose.Types.ObjectId();
const trackTwoId = new mongoose.Types.ObjectId();
const trackThreeId = new mongoose.Types.ObjectId();

const feedbackOneId = new mongoose.Types.ObjectId();
const feedbackTwoId = new mongoose.Types.ObjectId();

// User Data
export const users = [
	{
		_id: userOneId,
		email: 'user1@example.com',
		name: 'User1',
		displayPicture: '',
		googleID: '11223344',
		submittedTutorials: [tutorialOneId],
		favorites: [tutorialOneId, tutorialTwoId],
		tracks: [
			{
				_id: new mongoose.Types.ObjectId(),
				track: trackOneId,
				trackProgressIndex: 0
			},
			{
				_id: new mongoose.Types.ObjectId(),
				track: trackThreeId,
				trackProgressIndex: 2
			}
		],
		isAdmin: true,
		isSuperAdmin: false
	},
	{
		_id: userTwoId,
		email: 'user2@example.com',
		name: 'User2',
		displayPicture: '',
		googleID: '55667788',
		submittedTutorials: [tutorialTwoId, tutorialThreeId],
		favorites: [tutorialThreeId],
		tracks: [
			{
				_id: new mongoose.Types.ObjectId(),
				track: trackOneId,
				trackProgressIndex: 0
			}
		],
		isAdmin: false,
		isSuperAdmin: false
	},
	{
		_id: userThreeId,
		email: 'user3@example.com',
		name: 'User3',
		displayPicture: '',
		googleID: '12121212',
		submittedTutorials: [],
		favorites: [tutorialOneId, tutorialTwoId, tutorialThreeId],
		tracks: [],
		isAdmin: true,
		isSuperAdmin: true
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
		isApproved: false
	}
];

// Track Data
export const tracks = [
	{
		_id: trackOneId,
		name: 'Front-end Developer Roadmap',
		description: 'Beginner to Advanced Front-end developer roadmap',
		tutorials: [tutorialOneId, tutorialThreeId],
		submittedBy: {
			name: users[0].name,
			userId: users[0]._id
		},
		isApproved: false
	},
	{
		_id: trackTwoId,
		name: 'Back-end Developer Roadmap',
		description: 'Beginner to Advanced Back-end developer roadmap',
		tutorials: [tutorialTwoId, tutorialThreeId],
		submittedBy: {
			name: users[1].name,
			userId: users[1]._id
		},
		isApproved: false
	},
	{
		_id: trackThreeId,
		name: 'Full stack Developer Roadmap',
		description: 'Beginner to Advanced Full stack developer roadmap',
		tutorials: [tutorialOneId, tutorialTwoId, tutorialThreeId],
		submittedBy: {
			name: users[1].name,
			userId: users[1]._id
		},
		isApproved: true
	}
];

// Feedback Data
export const feedbacks = [
	{
		_id: feedbackOneId,
		title: 'Feedback One Title',
		message: 'Feedback One Message',
		isRead: false,
		submittedBy: {
			name: users[1].name,
			userId: users[1]._id
		}
	},
	{
		_id: feedbackTwoId,
		title: 'Feedback Two Title',
		message: 'Feedback Two Message',
		isRead: true,
		submittedBy: {
			name: users[1].name,
			userId: users[1]._id
		}
	}
];

// Utils data
export const stringsToSlugify = {
	tags: [
		{ tag: 'React', slug: 'react' },
		{ tag: 'Machine Learning', slug: 'machine-learning' },
		{ tag: 'C#', slug: 'c-sharp' },
		{ tag: 'C++', slug: 'c-plus-plus' },
		{ tag: '.NET', slug: 'dot-net' },
		{ tag: 'ASP.NET', slug: 'asp-dot-net' }
	],
	tutorials: [
		{ tutorial: 'Node.js Tutorials', slug: 'nodejs-tutorials' },
		{ tutorial: 'React and Redux: Complete guide', slug: 'react-and-redux-complete-guide' },
		{ tutorial: 'C# for beginners', slug: 'c-sharp-for-beginners' },
		{ tutorial: 'C/C++ for beginners', slug: 'c-c-plus-plus-for-beginners' },
		{ tutorial: 'Python noob_to_pro!', slug: 'python-noob-to-pro' }
	],
	tracks: [
		{ track: 'Game development with C#', slug: 'game-development-with-c-sharp' },
		{ track: 'Learn Unreal Engine using C++', slug: 'learn-unreal-engine-using-c-plus-plus' },
		{ track: 'UI/UX development', slug: 'ui-ux-development' }
	]
};
