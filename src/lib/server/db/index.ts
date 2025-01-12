import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Load environment variables based on context
let databaseUrl: string;

if (process.env.DATABASE_URL) {
	// Running in script context (tsx)
	databaseUrl = process.env.DATABASE_URL;
} else {
	// Running in SvelteKit context
	const { env } = await import('$env/dynamic/private');
	databaseUrl = env.DATABASE_URL!;
}

if (!databaseUrl) throw new Error('DATABASE_URL is not set');

console.log('Initializing database connections...');

// Create a postgres client for migrations and seeding
export const migrationClient = postgres(databaseUrl, { max: 1 });

// Create a postgres client for the application with prepared statements
export const client = postgres(databaseUrl, {
	prepare: true,
	max: 20,
	onnotice: (notice) => {
		console.log('Database notice:', notice);
	},
	debug: (connection, query, params, types) => {
		console.log('Database query:', {
			query,
			params,
			types
		});
	}
});

// Initialize drizzle with schema and relations
export const db = drizzle(client, {
	schema,
	logger: false
});

console.log('Database connections initialized');
