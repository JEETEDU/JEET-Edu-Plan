import * as schema from "@/database/schema";
import mysql from "mysql2/promise";
import {drizzle} from "drizzle-orm/mysql2";

export const poolConnection = mysql.createPool({
    host: process.env["DB_HOST"],
    port: process.env["DB_PORT"],
    user: process.env["DB_USER"],
    password: process.env["DB_PSWD"],
    database: process.env["DB_NAME"],
});

export const db = drizzle(poolConnection, {schema, mode: 'planetscale'});