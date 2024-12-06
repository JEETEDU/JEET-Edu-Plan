import { mysqlTable, int, text, } from "drizzle-orm/mysql-core";
// 각 type은 공식문서 참고

export const usersTable = mysqlTable('users', {
    id: int('id').autoincrement().primaryKey(),
    name: text('name').notNull(),
    password: text('password').notNull(),
});