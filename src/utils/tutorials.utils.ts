import Joi from '@hapi/joi';
import mongoose from 'mongoose';
import normalizeUrl from 'normalize-url';

export const validateTutorial = (tutorial: any): Joi.ValidationResult => {
	const tutorialSchema = Joi.object({
		title: Joi.string()
			.required()
			.trim()
			.min(1)
			.messages({
				'any.required': 'Tutorial title is required',
				'string.empty': 'Tutorial title is required',
				'string.base': 'Tutorial title must be a string'
			}),
		link: Joi.string()
			.required()
			.trim()
			.uri()
			.messages({
				'any.required': 'Tutorial link is required',
				'string.empty': 'Tutorial link is required',
				'string.base': 'Tutorial link must be a string',
				'string.uri': 'Invalid tutorial link'
			})
			.custom((value, helpers) =>
				normalizeUrl(value, {
					defaultProtocol: 'https://',
					stripHash: true,
					stripWWW: false
				})
			),
		tags: Joi.array()
			.required()
			.items(
				Joi.string()
					.required()
					.custom((value, helpers) => {
						if (!mongoose.Types.ObjectId.isValid(value)) {
							return helpers.error('any.Invalid');
						}

						return value;
					})
			)
			.max(5)
			.messages({
				'any.required': 'At least one tag is required',
				'any.Invalid': 'Invalid Tag Id',
				'array.includesRequiredUnknowns': 'At least one tag is required',
				'array.max': 'A tutorial can contain maximum of 5 tags',
				'string.empty': 'Tutorial tag cannot be empty',
				'string.base': 'Tutorial tag must be a string'
			}),
		educator: Joi.string()
			.required()
			.trim()
			.min(1)
			.messages({
				'any.required': 'Educator name is required',
				'string.empty': 'Educator name is required',
				'string.base': 'Educator name must be a string'
			}),
		medium: Joi.string()
			.required()
			.trim()
			.valid('Video', 'Blog')
			.messages({
				'any.required': 'Tutorial medium is required',
				'any.only': 'Tutorial medium should be one of "Video" or "Blog"'
			}),
		typeOfTutorial: Joi.string()
			.required()
			.trim()
			.valid('Free', 'Paid')
			.messages({
				'any.required': 'Tutorial type is required',
				'any.only': 'Tutorial type should be one of "Free" or "Paid"'
			}),
		skillLevel: Joi.string()
			.required()
			.trim()
			.valid('Beginner', 'Intermediate', 'Advanced')
			.messages({
				'any.required': 'Tutorial skill level is required',
				'any.only':
					'Tutorial skill level should be one of "Beginner", "Intermediate" or "Advanced"'
			})
	}).options({ stripUnknown: true });

	return tutorialSchema.validate(tutorial);
};

export const validateUpdate = (tutorial: any): Joi.ValidationResult => {
	const tutorialSchema = Joi.object({
		title: Joi.string()
			.trim()
			.min(1)
			.messages({
				'any.required': 'Tutorial title is required',
				'string.empty': 'Tutorial title is required',
				'string.base': 'Tutorial title must be a string'
			}),
		link: Joi.string()
			.trim()
			.uri()
			.messages({
				'any.required': 'Tutorial link is required',
				'string.empty': 'Tutorial link is required',
				'string.base': 'Tutorial link must be a string',
				'string.uri': 'Invalid tutorial link'
			})
			.custom((value, helpers) =>
				normalizeUrl(value, {
					defaultProtocol: 'https://',
					stripHash: true,
					stripWWW: false
				})
			),
		tags: Joi.array()
			.items(
				Joi.string()
					.required()
					.custom((value, helpers) => {
						if (!mongoose.Types.ObjectId.isValid(value)) {
							return helpers.error('any.Invalid');
						}

						return value;
					})
			)
			.max(5)
			.messages({
				'any.required': 'At least one tag is required',
				'any.Invalid': 'Invalid Tag Id',
				'array.includesRequiredUnknowns': 'At least one tag is required',
				'array.max': 'A tutorial can contain maximum of 5 tags',
				'string.empty': 'Tutorial tag cannot be empty',
				'string.base': 'Tutorial tag must be a string'
			}),
		educator: Joi.string()
			.trim()
			.min(1)
			.messages({
				'any.required': 'Educator name is required',
				'string.empty': 'Educator name is required',
				'string.base': 'Educator name must be a string'
			}),
		medium: Joi.string()
			.trim()
			.valid('Video', 'Blog')
			.messages({
				'any.required': 'Tutorial medium is required',
				'any.only': 'Tutorial medium should be one of "Video" or "Blog"'
			}),
		typeOfTutorial: Joi.string()
			.trim()
			.valid('Free', 'Paid')
			.messages({
				'any.required': 'Tutorial type is required',
				'any.only': 'Tutorial type should be one of "Free" or "Paid"'
			}),
		skillLevel: Joi.string()
			.trim()
			.valid('Beginner', 'Intermediate', 'Advanced')
			.messages({
				'any.required': 'Tutorial skill level is required',
				'any.only':
					'Tutorial skill level should be one of "Beginner", "Intermediate" or "Advanced"'
			})
	}).options({ stripUnknown: true });

	return tutorialSchema.validate(tutorial);
};
