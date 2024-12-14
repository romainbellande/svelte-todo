import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { item } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getObject } from '$lib/server/s3';
import { env } from '@/server/env';

export async function GET({ params }) {
	const existingItem = await db.query.item.findFirst({
		where: eq(item.id, params.id)
	});

	if (!existingItem || !existingItem.billingFileKey) {
		throw error(404, 'Billing file not found');
	}

	try {
		const file = await getObject(existingItem.billingFileKey, env.s3.inventoryBucketName);
		const filename = existingItem.billingFileKey.split('/').pop() || 'billing-file';

		// Convert the streaming response to a ReadableStream
		const stream = file.Body?.transformToWebStream();

		return new Response(stream, {
			headers: {
				'Content-Type': file.ContentType || 'application/octet-stream',
				'Content-Disposition': `inline; filename="${filename}"`,
				'Cache-Control': 'no-cache'
			}
		});
	} catch (err) {
		console.error('Error downloading file:', err);
		throw error(500, 'Failed to download file');
	}
}
