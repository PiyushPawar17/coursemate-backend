import User from '../../models/User';
import Tag from '../../models/Tag';
import Tutorial from '../../models/Tutorial';
import Track from '../../models/Track';
import Feedback from '../../models/Feedback';

import { users, tags, tutorials, tracks, feedbacks } from './data';

export const populateUsers = (done: jest.DoneCallback) => {
	User.create(users).then(() => done());
};

export const removeUsers = (done: jest.DoneCallback) => {
	User.deleteMany({}).then(() => done());
};

export const populateTags = (done: jest.DoneCallback) => {
	Tag.create(tags).then(() => done());
};

export const removeTags = (done: jest.DoneCallback) => {
	Tag.deleteMany({}).then(() => done());
};

export const populateTutorials = (done: jest.DoneCallback) => {
	Tutorial.create(tutorials).then(() => done());
};

export const removeTutorials = (done: jest.DoneCallback) => {
	Tutorial.deleteMany({}).then(() => done());
};

export const populateTracks = (done: jest.DoneCallback) => {
	Track.create(tracks).then(() => done());
};

export const removeTracks = (done: jest.DoneCallback) => {
	Track.deleteMany({}).then(() => done());
};

export const populateFeedbacks = (done: jest.DoneCallback) => {
	Feedback.create(feedbacks).then(() => done());
};

export const removeFeedbacks = (done: jest.DoneCallback) => {
	Feedback.deleteMany({}).then(() => done());
};
