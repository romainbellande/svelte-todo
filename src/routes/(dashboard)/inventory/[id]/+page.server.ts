import { db } from '$lib/server/db';
import { item } from '$lib/server/db/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { inventorySchema } from './schema';
import { billingSchema } from './billing-schema';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { uploadFile } from '$lib/server/s3';
import { env } from '@/server/env';

export const load: PageServerLoad = async ({ params }) => {
	if (params.id === 'new') {
		const users = await db.query.user.findMany({
			columns: {
				id: true,
				firstname: true,
				lastname: true
			}
		});

		const form = await superValidate(zod(inventorySchema));
		const billingForm = await superValidate(zod(billingSchema));

		return {
			form,
			billingForm,
			users: users.map((u) => ({
				id: u.id,
				name: `${u.firstname} ${u.lastname}`
			}))
		};
	}

	const existingItem = await db.query.item.findFirst({
		where: eq(item.id, params.id),
		with: {
			assignee: true
		}
	});

	if (!existingItem) {
		throw error(404, 'Item not found');
	}

	const users = await db.query.user.findMany({
		columns: {
			id: true,
			firstname: true,
			lastname: true
		}
	});

	const formData = {
		reference: existingItem.reference,
		name: existingItem.name,
		assigneeId: existingItem.assigneeId || undefined,
	};

	const form = await superValidate(formData, zod(inventorySchema));
	const billingForm = await superValidate(zod(billingSchema));

	return {
		form,
		billingForm,
		item: existingItem,
		users: users.map((u) => ({
			id: u.id,
			name: `${u.firstname} ${u.lastname}`
		}))
	};
};

export const actions: Actions = {
	async save({ request, params }) {
		const formData = await superValidate(request, zod(inventorySchema));

		if (!formData.valid) {
			return fail(400, {
				form: formData
			});
		}

		let billingFileKey: string | undefined;

		const { data } = formData;

		const assigneeId =
			data.assigneeId && data.assigneeId.trim() !== '' ? data.assigneeId : null;
		const assignedAt = assigneeId ? new Date() : null;

		if (params.id === 'new') {
			await db.insert(item).values({
				name: data.name,
				reference: data.reference,
				assigneeId,
				assignedAt,
				billingFileKey
			});
		} else {
			const currentItem = await db.query.item.findFirst({
				where: eq(item.id, params.id)
			});

			const assignedAtValue =
				currentItem?.assigneeId !== assigneeId ? assignedAt : currentItem?.assignedAt;

			await db
				.update(item)
				.set({
					name: data.name,
					reference: data.reference,
					assigneeId,
					assignedAt: assignedAtValue,
					billingFileKey,
					updatedAt: new Date()
				})
				.where(eq(item.id, params.id));
		}

		throw redirect(303, '/inventory');
	},

	async uploadBilling({ request, params }) {
		const formData = await request.formData();
		const billingFile = formData.get('billingFile') as File;
		const form = await superValidate(zod(billingSchema));

		if (!billingFile || billingFile.size === 0) {
			form.errors._errors = ['No file provided'];
			return fail(400, { billingForm: form });
		}

		try {
			const fileKey = `${params.id}/${billingFile.name}`;
			const { Key } = await uploadFile(billingFile, fileKey, env.s3.inventoryBucketName);

			await db.update(item)
				.set({ billingFileKey: Key })
				.where(eq(item.id, params.id));

			return { billingForm: form };
		} catch (error) {
			console.error('Error uploading file:', error);
			form.errors._errors = ['Failed to upload file'];
			return fail(500, { billingForm: form });
		}
	},

	archive: async ({ params }) => {
		const [existingItem] = await db
			.update(item)
			.set({
				archivedAt: new Date(),
				updatedAt: new Date()
			})
			.where(eq(item.id, params.id))
			.returning();

		if (!existingItem) {
			throw error(404, 'Item not found');
		}

		throw redirect(303, '/inventory');
	},

	restore: async ({ params }) => {
		const [existingItem] = await db
			.update(item)
			.set({
				archivedAt: null,
				updatedAt: new Date()
			})
			.where(eq(item.id, params.id))
			.returning();

		if (!existingItem) {
			throw error(404, 'Item not found');
		}

		throw redirect(303, '/inventory/archived');
	}
};
