import {defineConfig} from 'drizzle-kit';

export default defineConfig({
    dialect: "mysql",
    dbCredentials: {
        host: process.env["DB_HOST"] as string,
        port: Number(process.env["DB_PORT"]),
        user: process.env["DB_USER"] as string,
        password: process.env["DB_PSWD"] as string,
        database: process.env["DB_NAME"] as string,
    },
    schema: './src/database/schema.ts',
    out: './src/database/drizzle',
});