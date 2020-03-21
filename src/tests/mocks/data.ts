import mongoose from 'mongoose';

const userOneId = new mongoose.Types.ObjectId();
const userTwoId = new mongoose.Types.ObjectId();

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
		_id: new mongoose.Types.ObjectId(),
		name: 'Express',
		isApproved: true
	},
	{
		_id: new mongoose.Types.ObjectId(),
		name: 'Machine Learning',
		isApproved: false
	},
	{
		_id: new mongoose.Types.ObjectId(),
		name: 'C++',
		isApproved: false
	}
];
