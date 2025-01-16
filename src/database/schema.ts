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
import {relations, sql} from "drizzle-orm";

// User table
export const users = mysqlTable('user', {
    uid: int().autoincrement().primaryKey(),
    login_id: char({ length: 20 }).notNull().unique(),
    pw: binary({ length: 32 }).notNull(),
    user_type: tinyint().notNull().default(0),
    name: char({ length: 5 }).notNull(),
    first_year: year(),
    school: varchar({ length: 255 }),
    joined_term: varchar({ length: 20 }),
});

// User Relation
export const userRelations = relations(
    users,
    ({ many }) => ({
            alerts: many(alerts),
            boards: many(boards),
            studentClasses: many(studentClasses),
            teacherClasses: many(teacherClasses),
            homeworks: many(homeworks),
            sleeps: many(sleeps),
            todayAnswers: many(todayAnswers),
            todos: many(todoes),
            logs: many(logs)
        })
);

// Class Info table
export const classes = mysqlTable('class_info', {
    id: int().autoincrement().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    display: tinyint().notNull().default(1),
    description: varchar({ length: 255 }),
});

export const classInfoRelations = relations(
    classes,
    ({ many }) => ({
        boards: many(boards),
        studentClasses: many(studentClasses),
        teacherClasses: many(teacherClasses),
        timetables: many(timetables),
        homeworks: many(homeworks),
        subjects: many(subjects),
    })
);

// Relation table between teacher and class
export const teacherClasses = mysqlTable('teacher_class', {
    user_id: int().notNull().references(() => users.uid, { onDelete: 'cascade' }),
    class_id: int().notNull().references(() => classes.id, { onDelete: 'cascade' }),
    subject_id: int().notNull().references(() => subjects.id, { onDelete: 'cascade' }),
});

// Board table
export const boards = mysqlTable('board', {
    id: int().autoincrement().primaryKey(),
    class_id: int().notNull().references(() => classes.id),
    user_id: int().notNull().references(() => users.uid),
    title: varchar({ length: 255 }).notNull(),
    content: longtext().notNull(),
    create_time: datetime().notNull().default(sql`CURRENT_TIMESTAMP()`),
    update_time: datetime().notNull().default(sql`CURRENT_TIMESTAMP()`),
    attach_files: json(),
    category: tinyint(),
    notice: tinyint(),
    due_date: date(),
    view_count: int().notNull(),
    comment_count: int().notNull(),
    subject_id: int().references(() => subjects.id),
});

// Relation table between user and class
export const studentClasses = mysqlTable('student_class', {
    user_id: int().notNull().references(() => users.uid, { onDelete: 'cascade' }),
    class_id: int().notNull().references(() => classes.id, { onDelete: 'cascade' }),
});

// Homework table
export const homeworks = mysqlTable('homework', {
    article_id: int().notNull().references(() => boards.id, { onDelete: 'cascade' }),
    user_id: int().notNull().references(() => users.uid, { onDelete: 'cascade' }),
    due_date: date(),
    done: tinyint(),
    cid: int().notNull().references(() => classes.id, { onDelete: 'cascade' }),
    title: varchar({ length: 255 }).notNull(),
    subject_id: int().notNull().references(() => subjects.id, { onDelete: 'cascade' }),
}, (table) => {
    return {
        pk: primaryKey(table.article_id, table.user_id)
    };
});

// Sleep table
export const sleeps = mysqlTable('sleep', {
    date: date().notNull().default(sql`CURDATE()`),
    user_id: int().notNull().references(() => users.uid, { onDelete: 'cascade' }),
    wakeup: datetime(),
    sleep: datetime(),
}, (table) => {
    return {
        pk: primaryKey(table.date, table.user_id)
    };
});

// Today Question table
export const todayQuestions = mysqlTable('today_question', {
    date: date().notNull().primaryKey(),
    question_1: longtext(),
    question_2: longtext(),
    question_3: longtext()
});

// Today Answer table
export const todayAnswers = mysqlTable('today_answer', {
    date: date().notNull(),
    user_id: int().notNull().references(() => users.uid, { onDelete: 'cascade' }),
    answer_1: longtext(),
    answer_2: longtext(),
    answer_3: longtext(),
    answer_lastday: longtext(),
    answer_school: longtext(),
    answer_academy: longtext()
}, (table) => {
    return {
        pk: primaryKey(table.date, table.user_id)
    };
});

// To_do table
export const todoes = mysqlTable('todo', {
    id: int().autoincrement().primaryKey(),
    user_id: int().notNull().references(() => users.uid, { onDelete: 'cascade' }),
    date: date().notNull(),
    content: varchar({ length: 255 }).notNull(),
    done: tinyint(),
    article_id: int().references(() => homeworks.article_id, { onDelete: 'cascade' }),
});

// Timetable table
export const timetables = mysqlTable('timetable', {
    id: int().autoincrement().primaryKey(),
    class_id: int().notNull().references(() => classes.id, { onDelete: 'cascade' }),
    subject_id: int().notNull().references(() => subjects.id, { onDelete: 'cascade' }),
    day: mysqlEnum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).notNull(),
    start: time().notNull(),
    end: time().notNull(),
});

// Subject table
export const subjects = mysqlTable('subject', {
    id: int().autoincrement().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    class_id: int().notNull().references(() => classes.id, { onDelete: 'cascade' }),
});

// Comment table
export const comments = mysqlTable('comment', {
    id: int().autoincrement().primaryKey(),
    article_id: int().notNull().references(() => boards.id, { onDelete: 'cascade' }),
    user_id: int().notNull().references(() => users.uid),
    create_time: datetime().notNull().default(sql`CURRENT_TIMESTAMP()`),
    update_time: datetime().notNull().default(sql`CURRENT_TIMESTAMP()`),
    content: longtext().notNull(),
    attach_files: json(),
});

// Alert table
export const alerts = mysqlTable('alert', {
    id: int().autoincrement().primaryKey(),
    user_id: int().notNull().references(() => users.uid, { onDelete: 'cascade' }),
    read: tinyint(),
    alert_type: tinyint(),
    article_id: int().references(() => boards.id, { onDelete: 'cascade' }),
    message: varchar({ length: 255 }).notNull(),
});

// Log table
export const logs = mysqlTable('log', {
    id: int().autoincrement().primaryKey(),
    user_id: int().notNull().references(() => users.uid),
    detail: longtext().notNull(),
    time: datetime().notNull().default(sql`CURRENT_TIMESTAMP()`),
});

// Relation table between student and class
export const studentClassesRelations = relations(
    studentClasses,
    ({ one }) => ({
        user: one(users, {
            fields: [studentClasses.user_id],
            references: [users.uid]
        }),
        classInfo: one(classes, {
            fields: [studentClasses.class_id],
            references: [classes.id]
        })
    })
);

export const file = mysqlTable('file', {
    id: char({length: 11}).primaryKey(),
    name: varchar({length: 255}).notNull(),
});