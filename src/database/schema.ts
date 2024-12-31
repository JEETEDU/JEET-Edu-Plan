import {
    mysqlTable,
    int,
    char,
    binary,
    tinyint,
    year,
    varchar,
    longtext,
    datetime,
    json,
    date,
    time,
    mysqlEnum,
    primaryKey
} from "drizzle-orm/mysql-core";
import {sql} from "drizzle-orm";

// User table
export const usersTable = mysqlTable('user', {
    uid: int().autoincrement().primaryKey(),
    login_id: char({ length: 20 }).notNull().unique(),
    pw: binary({ length: 32 }).notNull(),
    user_type: tinyint().notNull().default(0),
    name: char({ length: 5 }).notNull(),
    first_year: year(),
    school: varchar({ length: 255 }),
    joined_term: varchar({ length: 20 }),
});

// Class Info table
export const classInfoTable = mysqlTable('class_info', {
    id: int().autoincrement().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    display: tinyint().notNull().default(1),
});

// Teacher Class table
export const teacherClassTable = mysqlTable('teacher_class', {
    user_id: int().notNull().references(() => usersTable.uid),
    class_id: int().notNull().references(() => classInfoTable.id),
    subjec_id: int().notNull().references(() => subjectTable.id),
});

// Board table
export const boardTable = mysqlTable('board', {
    id: int().autoincrement().primaryKey(),
    class_id: int().notNull().references(() => classInfoTable.id),
    user_id: int().notNull().references(() => usersTable.uid),
    title: varchar({ length: 255 }).notNull(),
    content: longtext(),
    create_time: datetime().notNull().default(sql`CURRENT_TIMESTAMP()`),
    update_time: datetime().notNull().default(sql`CURRENT_TIMESTAMP()`).$onUpdate(() => sql`CURRENT_TIMESTAMP()`),
    attach_files: json(),
    category: tinyint(),
    notice: tinyint(),
    due_date: date(),
    tag_user_id: int().references(() => usersTable.uid),
    view_count: int().notNull(),
    comment_count: int().notNull(),
    subject_id: int().notNull().references(() => subjectTable.id),
});

// Student Class table
export const studentClassTable = mysqlTable('student_class', {
    user_id: int().notNull().references(() => usersTable.uid),
    class_id: int().notNull().references(() => classInfoTable.id),
});

// Homework table
export const homeworkTable = mysqlTable('homework', {
    article_id: int().notNull().references(() => boardTable.id),
    user_id: int().notNull().references(() => usersTable.uid),
    due_date: date(),
    done: tinyint(),
    cid: int().notNull().references(() => classInfoTable.id),
    title: varchar({ length: 255 }).notNull(),
    subject_id: int().notNull().references(() => subjectTable.id),
}, (table) => {
    return {
        pk: primaryKey(table.article_id, table.user_id)
    };
});

// Sleep table
export const sleepTable = mysqlTable('sleep', {
    date: date().notNull(),
    user_id: int().notNull().references(() => usersTable.uid),
    wakeup: datetime(),
    sleep: datetime(),
}, (table) => {
    return {
        pk: primaryKey(table.date, table.user_id)
    };
});

// Today Question table
export const todayQuestionTable = mysqlTable('today_question', {
    date: date().notNull().primaryKey(),
    question: longtext().notNull(),
});

// Today Answer table
export const todayAnswerTable = mysqlTable('today_answer', {
    date: date().notNull().references(() => todayQuestionTable.date),
    user_id: int().notNull().references(() => usersTable.uid),
    answer: longtext().notNull(),
}, (table) => {
    return {
        pk: primaryKey(table.date, table.user_id)
    };
});

// To_do table
export const todoTable = mysqlTable('todo', {
    id: int().autoincrement().primaryKey(),
    user_id: int().notNull().references(() => usersTable.uid),
    date: date().notNull(),
    content: varchar({ length: 255 }).notNull(),
    done: tinyint(),
    article_id: int().references(() => homeworkTable.article_id),
});

// Timetable table
export const timetableTable = mysqlTable('timetable', {
    id: int().autoincrement().primaryKey(),
    class_id: int().notNull().references(() => classInfoTable.id),
    subject_id: int().notNull().references(() => subjectTable.id),
    day: mysqlEnum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).notNull(),
    start: time().notNull(),
    end: time().notNull(),
});

// Subject table
export const subjectTable = mysqlTable('subject', {
    id: int().autoincrement().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    user_id: int().notNull().references(() => usersTable.uid),
});

// Comment table
export const commentTable = mysqlTable('comment', {
    id: int().autoincrement().primaryKey(),
    id2: int().notNull().references(() => boardTable.id),
    id3: int().notNull().references(() => usersTable.uid),
    content: longtext().notNull(),
    attach_files: json(),
});

// Alert table
export const alertTable = mysqlTable('alert', {
    id: int().autoincrement().primaryKey(),
    user_id: int().notNull().references(() => usersTable.uid),
    read: tinyint(),
    alert_type: tinyint(),
    article_id: int().references(() => boardTable.id),
    message: varchar({ length: 255 }).notNull(),
});

// Log table
export const logTable = mysqlTable('log', {
    id: int().autoincrement().primaryKey(),
    user_id: int().notNull().references(() => usersTable.uid),
    detail: longtext().notNull(),
    time: datetime().notNull().default(sql`CURRENT_TIMESTAMP()`),
});