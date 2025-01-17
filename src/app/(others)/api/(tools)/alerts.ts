import { db } from '@/database';
import * as schema from '@/database/schema';
import {and, asc, count, desc, eq, like, sql} from 'drizzle-orm';
import {MySqlTransaction, QueryBuilder} from "drizzle-orm/mysql-core";

type TX = MySqlTransaction<any, any, any, any>;

export async function register_alert(tx: TX, user_id: number, message: string, alert_type: number = 0, article_id: number | null = null): Promise<void> {
    await tx.insert(schema.alerts).values({
        user_id: user_id,
        message: message,
        alert_type: alert_type,
        article_id: article_id
    });
}

export async function delete_alert(tx: TX, user_id: number, alert_id: number): Promise<void> {
    await tx.delete(schema.alerts)
        .where(and(eq(schema.alerts.user_id, user_id), eq(schema.alerts.id, alert_id)));
}