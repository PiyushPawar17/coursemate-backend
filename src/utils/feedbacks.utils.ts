import Joi from '@hapi/joi';

export const validateFeedback = (feedback: any): Joi.ValidationResult => {
	const feedbackSchema = Joi.object({
		title: Joi.string()
			.required()
			.trim()
			.min(1)
			.messages({
				'any.required': 'Feedback title is required',
				'string.empty': 'Feedback title is required',
				'string.base': 'Feedback title must be a string'
			}),
		message: Joi.string()
			.required()
			.trim()
			.min(1)
			.messages({
				'any.required': 'Feedback message is required',
				'string.empty': 'Feedback message is required',
				'string.base': 'Feedback message must be a string'
			})
	}).options({ stripUnknown: true });

	return feedbackSchema.validate(feedback);
};
