import { z } from 'zod';
import { env as privateEnv } from '$env/dynamic/private';
import type { S3ClientConfig } from '@aws-sdk/client-s3';

const dynamicPrivateEnvSchema = z.object({
	S3_ACCESS_KEY_ID: z.string().min(1, 'S3 Access Key ID is required'),
	S3_SECRET_ACCESS_KEY: z.string().min(1, 'S3 Secret Access Key is required'),
	S3_INVENTORY_BUCKET_NAME: z.string().min(1, 'S3 Bucket Name is required'),
	S3_REGION: z.string().min(1, 'S3 Region is required'),
	S3_ENDPOINT: z.string().optional(),
	S3_FORCE_PATH_STYLE: z.enum(['true', 'false']).optional()
});

export type ServerEnv = z.infer<typeof dynamicPrivateEnvSchema>;

function validateEnv(env: Record<string, string | undefined>): ServerEnv {
	try {
		return dynamicPrivateEnvSchema.parse(env);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const missingVars = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
			throw new Error(`Environment validation failed:\n${missingVars.join('\n')}`);
		}
		throw error;
	}
}

interface S3Config extends S3ClientConfig {
	inventoryBucketName: string;
}

class Environment {
	env: ServerEnv;

	constructor(env: Record<string, string | undefined>) {
		this.env = validateEnv(env);
	}

	get s3(): S3Config {
		return {
			credentials: {
				accessKeyId: this.env.S3_ACCESS_KEY_ID,
				secretAccessKey: this.env.S3_SECRET_ACCESS_KEY
			},
			inventoryBucketName: this.env.S3_INVENTORY_BUCKET_NAME,
			region: this.env.S3_REGION,
			endpoint: this.env.S3_ENDPOINT,
			forcePathStyle: this.env.S3_FORCE_PATH_STYLE === 'true'
		};
	}
}

export const env = new Environment(privateEnv);
