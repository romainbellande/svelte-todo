import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { env } from '$lib/server/env';

export const s3Client = new S3Client(env.s3);

export async function uploadFile(file: File, key: string, bucket: string) {
	const upload = new Upload({
		client: s3Client,
		params: {
			Bucket: bucket,
			Key: key,
			Body: file,
			ContentType: file.type
		}
	});

	return upload.done();
}

export async function getObject(key: string, bucket: string) {
	const command = new GetObjectCommand({
		Bucket: bucket,
		Key: key
	});

	return s3Client.send(command);
}
