import { z } from 'zod';
import dotenv from 'dotenv';

// Load environmental variables
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string({
    required_error: 'MONGODB_URI is required for database connection.',
  }).url('MONGODB_URI must be a valid connection URL.'),
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL.').optional(),
  JWT_SECRET: z.string({
    required_error: 'JWT_SECRET is required to sign tokens.',
  }).min(10, 'JWT_SECRET should be a secure key containing at least 10 characters.'),
  JWT_EXPIRES_IN: z.string().default('7d'),
});

// Perform validation
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Environment validation failed. Please check your .env settings:');
  parseResult.error.issues.forEach((issue) => {
    console.error(`   - [${issue.path.join('.')}] ${issue.message}`);
  });
  process.exit(1);
}

// Export parsed and safe environmental values
export const env = parseResult.data;
