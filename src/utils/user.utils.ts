import Joi from '@hapi/joi';

export const validateUser = (user: any): Joi.ValidationResult => {
	const userSchema = Joi.object({
		name: Joi.string()
			.required()
			.trim()
			.min(1)
			.messages({
				'any.required': 'User name is required',
				'string.empty': 'User name is required',
				'string.base': 'User name must be a string'
			})
	}).options({ stripUnknown: true });

	return userSchema.validate(user);
};

export const validateTrackProgress = (track: any): Joi.ValidationResult => {
	const trackProgressSchema = Joi.object({
		trackProgressIndex: Joi.number()
			.required()
			.messages({
				'any.required': 'Track progress required',
				'number.base': 'Track progress must be a number'
			})
	}).options({ stripUnknown: true });

	return trackProgressSchema.validate(track);
};
