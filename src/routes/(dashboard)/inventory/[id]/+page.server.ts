import { db } from '$lib/server/db';
import { item } from '$lib/server/db/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { inventorySchema } from './schema';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async ({ params }) => {
    if (params.id === 'new') {
        const users = await db.query.user.findMany({
            columns: {
                id: true,
                firstname: true,
                lastname: true,
            }
        });

        const form = await superValidate(zod(inventorySchema));

        return {
            form,
            users: users.map(u => ({
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
            lastname: true,
        }
    });

    const form = await superValidate(existingItem, zod(inventorySchema));

    return {
        form,
        item: existingItem,
        users: users.map(u => ({
            id: u.id,
            name: `${u.firstname} ${u.lastname}`
        }))
    };
};

export const actions: Actions = {
    async save({ request, params }) {
        const form = await superValidate(request, zod(inventorySchema));

        if (!form.valid) {
            return fail(400, { form });
        }

        const assigneeId = form.data.assigneeId && form.data.assigneeId.trim() !== '' ? form.data.assigneeId : null;
        const assignedAt = assigneeId ? new Date() : null;

        console.log({
            assigneeId,
            assignedAt
        })

        if (params.id === 'new') {
            await db.insert(item).values({
                name: form.data.name,
                reference: form.data.reference,
                assigneeId,
                assignedAt
            });
        } else {
            const currentItem = await db.query.item.findFirst({
                where: eq(item.id, params.id)
            });

            const assignedAtValue = currentItem?.assigneeId !== assigneeId ? assignedAt : currentItem?.assignedAt;

            await db.update(item)
                .set({
                    name: form.data.name,
                    reference: form.data.reference,
                    assigneeId,
                    assignedAt: assignedAtValue,
                    updatedAt: new Date()
                })
                .where(eq(item.id, params.id));
        }

        throw redirect(303, '/inventory');
    },

    delete: async ({ params }) => {
        const [existingItem] = await db
            .delete(item)
            .where(eq(item.id, params.id))
            .returning();

        if (!existingItem) {
            throw error(404, 'Item not found');
        }

        throw redirect(303, '/inventory');
    }
};
