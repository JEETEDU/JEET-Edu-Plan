import * as schema from '@/database/schema';
import {and, eq} from 'drizzle-orm';
import {MySqlTransaction} from "drizzle-orm/mysql-core";

type TX = MySqlTransaction<any, any, any, any>;
export enum AlertType {
    NORMAL = 0,
    NOTICE = 1,
    CALENDAR = 2,
    HOMEWORK = 3
}

export async function register_alert(tx: TX, user_id: number | [number], message: string, alert_type: number = 0, article_id: number | null = null): Promise<void> {
    if (Array.isArray(user_id)) {
        await tx.insert(schema.alerts).values(user_id.map((id) => ({
            user_id: id,
            message: message,
            alert_type: alert_type,
            article_id: article_id
        })));
        return;
    }
    await tx.insert(schema.alerts).values({
        user_id: user_id,
        message: message,
        alert_type: alert_type,
        article_id: article_id
    });
}

export async function register_alert_for_class(tx: TX, class_id: number, message: string, alert_type: number = 0, article_id: number | null = null): Promise<void> {
    const users = await tx.select({
        user_id: schema.studentClasses.user_id,
    })
        .from(schema.studentClasses)
        .where(eq(schema.studentClasses.class_id, class_id));
    console.log(users);
    // @ts-ignore
    await register_alert(tx, users.map((u) => u.user_id), message, alert_type, article_id);
}

export async function delete_alert(tx: TX, user_id: number, alert_id: number): Promise<void> {
    await tx.delete(schema.alerts)
        .where(and(eq(schema.alerts.user_id, user_id), eq(schema.alerts.id, alert_id)));
}

export async function delete_alerts_by_article(tx: TX, article_id: number, alert_type: number): Promise<void> {
    await tx.delete(schema.alerts)
        .where(and(eq(schema.alerts.article_id, article_id), eq(schema.alerts.alert_type, alert_type)));
}