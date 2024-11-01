import { mysqlTable, serial, text, } from "drizzle-orm/mysql-core";
// 각 type은 공식문서 참고

export const users = mysqlTable('users', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    password: text('password').notNull(),
});