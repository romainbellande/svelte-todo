import { migrationClient } from ".";
import * as schema from './schema'
import { hash } from '@node-rs/argon2';
import { reset } from "drizzle-seed";
import { drizzle } from "drizzle-orm/postgres-js";

const { user } = schema

const main = async () => {
    const migrationDb = drizzle(migrationClient, { schema });
    try {
        console.log('Resetting database...');
        await reset(migrationDb, schema);
        
        console.log('Seeding database...');
        console.log('Creating admin user...');

        await migrationDb.insert(user).values({
            passwordHash: await hash('mypassword'),
            email: 'admin@example.com',
            firstname: 'John',
            lastname: 'Doe'
        })

        console.log('Database seeded!');
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

main();
