import Joi from '@hapi/joi';

export const validateTag = (tag: any): Joi.ValidationResult => {
	const tagSchema = Joi.object({
		name: Joi.string()
			.required()
			.trim()
			.min(1)
			.max(30)
			.messages({
				'any.required': 'Tag name is required',
				'string.empty': 'Tag name is required',
				'string.base': 'Tag name must be a string',
				'string.max': 'Tag should contain maximum 30 characters'
			})
	}).options({ stripUnknown: true });

	return tagSchema.validate(tag);
};
