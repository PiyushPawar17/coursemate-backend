import User from '../../models/User';
import Tag from '../../models/Tag';

import { users, tags } from './data';

export const populateUsers = (done: jest.DoneCallback) => {
	const userOne = new User(users[0]).save();
	const userTwo = new User(users[1]).save();
	Promise.all([userOne, userTwo]).then(() => done());
};

export const removeUsers = (done: jest.DoneCallback) => {
	User.deleteMany({}).then(() => done());
};

export const populateTags = (done: jest.DoneCallback) => {
	Tag.insertMany(tags).then(() => done());
};

export const removeTags = (done: jest.DoneCallback) => {
	Tag.deleteMany({}).then(() => done());
};
