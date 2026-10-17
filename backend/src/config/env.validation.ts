import * as Joi from 'joi';

export function validateEnvironment(config: Record<string, unknown>) {
  const schema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
    PORT: Joi.number().port().default(3001),
    DATABASE_URL: Joi.string().uri({ scheme: ['postgres', 'postgresql'] }).required(),
    JWT_SECRET: Joi.string().min(32).required(),
    JWT_REFRESH_SECRET: Joi.string().min(32).required(),
    CORS_ORIGIN: Joi.string().required(),
    SEED_ADMIN_PASSWORD: Joi.string().allow('').optional(),
    SEED_MANAGER_PASSWORD: Joi.string().allow('').optional(),
    SEED_ANALYST_PASSWORD: Joi.string().allow('').optional(),
  }).unknown(true);

  const { error, value } = schema.validate(config, { abortEarly: false });
  if (error) {
    throw new Error(`Cấu hình môi trường không hợp lệ: ${error.message}`);
  }
  if (value.JWT_SECRET === value.JWT_REFRESH_SECRET) {
    throw new Error('JWT_SECRET và JWT_REFRESH_SECRET phải khác nhau để đảm bảo an toàn');
  }

  return value;
}
