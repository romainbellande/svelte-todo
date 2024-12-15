import { migrationClient } from '.';
import { user, board, referendum, referendumVote } from './schema';
import { hash } from '@node-rs/argon2';
import { reset } from 'drizzle-seed';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

async function seedDatabase() {
	const db = drizzle(migrationClient, { schema });

	try {
		await reset(db, schema);
		// Create users
		const now = new Date();
		const tomorrow = new Date(now);
		tomorrow.setDate(tomorrow.getDate() + 1);
		const nextWeek = new Date(now);
		nextWeek.setDate(nextWeek.getDate() + 7);
		const lastWeek = new Date(now);
		lastWeek.setDate(lastWeek.getDate() - 7);
		const yesterday = new Date(now);
		yesterday.setDate(yesterday.getDate() - 1);

		await db.delete(user);
		await db.delete(referendum);
		await db.delete(referendumVote);

		const passwordHash = await hash('mypassword');

		const [adminUser] = await db
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

		// Create sample referendums
		await db.insert(referendum).values([
			{
				title: 'Office Location Change',
				description: 'Proposal to move the office to a new location in downtown',
				fromDate: now,
				toDate: nextWeek,
				createdById: adminUser.id
			},
			{
				title: 'New Work Schedule',
				description: 'Proposal for flexible working hours',
				fromDate: tomorrow,
				toDate: nextWeek,
				createdById: adminUser.id
			},
			{
				title: 'Past Company Event',
				description: 'Vote for the past company event location',
				fromDate: lastWeek,
				toDate: yesterday,
				createdById: adminUser.id
			}
		]);

		// Create boards
		await db.insert(board).values([
			{
				name: 'Personal',
				userId: adminUser.id,
				createdAt: new Date(),
				updatedAt: new Date()
			},
			{
				name: 'Work',
				userId: adminUser.id,
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
