import { db } from ".";
import * as schema from './schema'
import { hash } from '@node-rs/argon2';
import { reset } from "drizzle-seed";

const { user } = schema

const main = async () => {
    await reset(db, schema);

    await db.insert(user).values({
        passwordHash: await hash('mypassword'),
        username: 'admin'
    })
}


main()