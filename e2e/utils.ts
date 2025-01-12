import type { Page } from '@playwright/test';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../src/lib/server/db/schema';
import { createSession } from '../src/lib/server/auth';

const db = drizzle.mock({ schema });

export interface TestUser {
	id: string;
	email: string;
	password: string;
	firstname: string;
	lastname: string;
}

export async function createTestUser(): Promise<TestUser> {
	const testUser: TestUser = {
		id: crypto.randomUUID(),
		email: `test-${Date.now()}@example.com`,
		password: 'testpassword123',
		firstname: 'Test',
		lastname: 'User'
	};

	await db.insert(schema.user).values({
		email: testUser.email,
		passwordHash: testUser.password, // In a real app, this should be hashed
		firstname: testUser.firstname,
		lastname: testUser.lastname
	});

	return testUser;
}

export async function loginTestUser(page: Page, testUser: TestUser) {
	// Create a session for the test user
	const session = await createSession('test-token', testUser.id);

	// Set the session cookie
	await page.context().addCookies([
		{
			name: 'auth-session',
			value: session.token,
			domain: 'localhost',
			path: '/'
		}
	]);
}
