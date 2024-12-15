import { migrationClient } from '.';
import { user, board } from './schema';
import { hash } from '@node-rs/argon2';
import { reset } from 'drizzle-seed';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

async function seedDatabase() {
	const db = drizzle(migrationClient, { schema });

	try {
		await reset(db, schema);
		// Create users
		const passwordHash = await hash('mypassword');
		const now = new Date();
		const users = await db
			.insert(user)
			.values([
				{
					email: 'admin@example.com',
					firstname: 'John',
					lastname: 'Doe',
					passwordHash,
					disabled: false,
					activatedAt: now, // Admin user is activated by default
					activationToken: null,
					activationTokenExpiresAt: null,
					createdAt: now,
					updatedAt: now
				},
				{
					email: 'jane@example.com',
					firstname: 'Jane',
					lastname: 'Smith',
					passwordHash,
					disabled: false,
					activatedAt: now, // Admin user is activated by default
					activationToken: null,
					activationTokenExpiresAt: null,
					createdAt: now,
					updatedAt: now
				}
			])
			.returning();

		// Create boards
		await db.insert(board).values([
			{
				name: 'Personal',
				userId: users[0].id,
				createdAt: new Date(),
				updatedAt: new Date()
			},
			{
				name: 'Work',
				userId: users[0].id,
				createdAt: new Date(),
				updatedAt: new Date()
			},
			{
				name: 'Shopping',
				userId: users[1].id,
				createdAt: new Date(),
				updatedAt: new Date()
			}
		]);
	} catch (error) {
		console.error('Error seeding database:', error);
		process.exit(1);
	} finally {
		// Close the migration database connection
		await migrationClient.end();
		console.log('Database connection closed.');
		process.exit(0);
	}
}

seedDatabase();
