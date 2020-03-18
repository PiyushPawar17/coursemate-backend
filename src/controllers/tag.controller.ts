import { Request, Response } from 'express';

import Tag from '../models/Tag';

export const addTag = (req: Request, res: Response) => {
	const tag = new Tag(req.body);

	tag.save().then(newTag => {
		res.status(201).json(newTag);
	});
};
