import Joi from '@hapi/joi';
import mongoose from 'mongoose';

export const validateTrack = (track: any): Joi.ValidationResult => {
	const trackSchema = Joi.object({
		name: Joi.string()
			.required()
			.trim()
			.min(1)
			.messages({
				'any.required': 'Track name is required',
				'string.empty': 'Track name is required',
				'string.base': 'Track name must be a string'
			}),
		description: Joi.string()
			.required()
			.trim()
			.min(1)
			.messages({
				'any.required': 'Track description is required',
				'string.empty': 'Track description is required',
				'string.base': 'Track description must be a string'
			}),
		tutorials: Joi.array()
			.required()
			.items(
				Joi.string()
					.required()
					.custom((value, helpers) => {
						if (!mongoose.Types.ObjectId.isValid(value)) {
							return helpers.error('any.invalid');
						}

						return value;
					})
			)
			.messages({
				'any.required': 'At least one tutorial is required',
				'any.invalid': 'Invalid Tutorial Id',
				'array.includesRequiredUnknowns': 'At least one tutorial is required',
				'string.empty': 'Tutorial Id cannot be empty',
				'string.base': 'Tutorial Id must be a string'
			})
	}).options({ stripUnknown: true });

	return trackSchema.validate(track);
};

export const validateUpdate = (track: any): Joi.ValidationResult => {
	const trackSchema = Joi.object({
		name: Joi.string()
			.trim()
			.min(1)
			.messages({
				'any.required': 'Track name is required',
				'string.empty': 'Track name is required',
				'string.base': 'Track name must be a string'
			}),
		description: Joi.string()
			.trim()
			.min(1)
			.messages({
				'any.required': 'Track description is required',
				'string.empty': 'Track description is required',
				'string.base': 'Track description must be a string'
			}),
		tutorials: Joi.array()
			.items(
				Joi.string()
					.required()
					.custom((value, helpers) => {
						if (!mongoose.Types.ObjectId.isValid(value)) {
							return helpers.error('any.invalid');
						}

						return value;
					})
			)
			.messages({
				'any.required': 'At least one tutorial is required',
				'any.invalid': 'Invalid Tutorial Id',
				'array.includesRequiredUnknowns': 'At least one tutorial is required',
				'string.empty': 'Tutorial Id cannot be empty',
				'string.base': 'Tutorial Id must be a string'
			})
	}).options({ stripUnknown: true });

	return trackSchema.validate(track);
};
