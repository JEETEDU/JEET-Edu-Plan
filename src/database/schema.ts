import { mysqlTable, int, char, binary, tinyint, year, varchar } from "drizzle-orm/mysql-core";
// 각 type은 공식문서 참고

/*
CREATE TABLE `user` (
	`uid`	INT AUTO_INCREMENT	NOT NULL,
	`login_id`	CHAR(20)	NOT NULL,
	`pw`	BINARY(16)	NOT NULL,
	`user_type`	TINYINT	NOT NULL	DEFAULT 0	COMMENT '미승인: 0, 학생:1, 강사: 2, 어드민: 3',
	`name`	CHAR(5)	NOT NULL,
	`first_year`	YEAR	NULL	COMMENT '강사는 NULL',
	`school`	VARCHAR(255)	NULL	COMMENT '강사는 NULL',
	`joined_term`	VARCHAR(20)	NULL	COMMENT '강사는 NULL'
);
 */
export const usersTable = mysqlTable('users', {
    uid: int().autoincrement().primaryKey(),
    login_id: char({length: 20}).notNull().unique(),
    pw: binary({length: 32}).notNull(),
    user_type: tinyint().notNull().default(0),
    name: char({length: 5}).notNull(),
    first_year: year(),
    school: varchar({length: 255}),
    joined_term: varchar({length: 20}),
});