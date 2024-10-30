import {defineConfig} from 'drizzle-kit';

export default defineConfig({
    dialect: "mysql",
    dbCredentials: {
        host: process.env["DB_HOST"],
        port: Number(process.env["DB_PORT"]),
        user: process.env["DB_USER"],
        password: process.env["DB_PSWD"],
        database: process.env["DB_NAME"],
    },
    schema: "./src/database/schema.ts",
    out: './src/database/drizzle',
});