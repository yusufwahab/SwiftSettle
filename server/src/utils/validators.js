const Joi = require("joi");

const phoneSchema = Joi.string()
  .pattern(/^\+?[0-9]{10,15}$/)
  .required()
  .messages({ "string.pattern.base": "Enter a valid phone number." });

const schemas = {
  signup: Joi.object({ phone_number: phoneSchema }),

  verifyOtp: Joi.object({
    phone_number: phoneSchema,
    otp_code: Joi.string().length(6).required(),
  }),

  onboardingStep: Joi.object({
    step: Joi.number().integer().min(1).max(8).required(),
    data: Joi.object().required(),
  }),

  completeSignup: Joi.object({
    full_name: Joi.string().min(2).required(),
    date_of_birth: Joi.date().iso().required(),
    state: Joi.string().required(),
    platform: Joi.string().required(),
    bank_name: Joi.string().required(),
    account_number: Joi.string().required(),
    account_holder_name: Joi.string().required(),
    pin: Joi.string().pattern(/^[0-9]{4,6}$/).required(),
    data_sharing_consent: Joi.boolean().valid(true).required(),
    terms_accepted: Joi.boolean().valid(true).required(),
  }),

  refreshToken: Joi.object({ refresh_token: Joi.string().required() }),

  createSettlement: Joi.object({ amount: Joi.number().positive().required() }),

  creditRequest: Joi.object({ amount: Joi.number().positive().required() }),

  nombaWebhook: Joi.object({
    event: Joi.string().required(),
    data: Joi.object().required(),
  }).unknown(true),

  platformWebhook: Joi.object({
    order_id: Joi.string().required(),
    worker_id: Joi.string().uuid().required(),
    amount: Joi.number().positive().required(),
    platform: Joi.string().required(),
  }).unknown(true),
};

function validate(schemaName) {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: false });
    if (error) {
      return res.status(400).json({
        error: "validation_error",
        message: error.details.map((d) => d.message).join(", "),
      });
    }
    req.body = value;
    next();
  };
}

module.exports = { schemas, validate };
