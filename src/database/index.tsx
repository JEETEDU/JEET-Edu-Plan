import * as schema from "@/database/schema";
import mysql from "mysql2/promise";
import {drizzle} from "drizzle-orm/mysql2";

// Singleton function to ensure only one db instance is created
function singleton<Value>(name: string, value: () => Value): Value {
    const globalAny: any = global;
    globalAny.__singletons = globalAny.__singletons || {};

    if (!globalAny.__singletons[name]) {
      globalAny.__singletons[name] = value();
    }

    return globalAny.__singletons[name];
}

// Function to create the database connection and apply migrations if needed
function createDatabaseConnection() {
    const poolConnection = mysql.createPool({
    host: process.env["DB_HOST"],
    port: process.env["DB_PORT"],
    user: process.env["DB_USER"],
    password: process.env["DB_PSWD"],
    database: process.env["DB_NAME"],
});
    return drizzle(poolConnection);
}

export const db = singleton('db', createDatabaseConnection);