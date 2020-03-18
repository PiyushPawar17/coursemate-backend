import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../server';

import Tag from '../models/Tag';

beforeAll(async () => {
	const { MONGO_URI = '' } = process.env;
	await mongoose.connect(MONGO_URI, { useNewUrlParser: true });
});

afterAll(async () => {
	await mongoose.connection.close();
});

it('should add new tag with supertest', done => {
	const newTag = {
		_id: new mongoose.Types.ObjectId(),
		name: 'JS'
	};

	request(app)
		.post('/api/tags')
		.send(newTag)
		.expect(201)
		.expect(res => {
			Tag.findById(newTag._id).then(dbTag => {
				expect(dbTag).toBeTruthy();
				expect(newTag.name).toBe(dbTag?.name);
			});
		})
		.end(done);
});
