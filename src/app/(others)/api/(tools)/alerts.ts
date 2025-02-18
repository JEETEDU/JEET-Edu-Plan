import * as schema from '@/database/schema';
import {and, eq} from 'drizzle-orm';
import {MySqlTransaction} from "drizzle-orm/mysql-core";
import {getMessaging} from "firebase-admin/messaging";
import {inArray} from "drizzle-orm/sql/expressions/conditions";
import {initializeApp} from 'firebase-admin/app';
import {credential, apps} from "firebase-admin";

if (!apps.length) {
   initializeApp({
        credential: credential.cert(process.env["GOOGLE_APPLICATION_CREDENTIALS"] ?? ''),
    })
}

type TX = MySqlTransaction<any, any, any, any>;
export enum AlertType {
    NORMAL = 0,
    NOTICE = 1,
    CALENDAR = 2,
    HOMEWORK = 3
}

export async function register_alert(tx: TX, user_id: number | [number], title: string, message: string, alert_type: number = 0, article_id: number | null = null): Promise<void> {
    let tokens: { fcm_token: string }[];
    if (Array.isArray(user_id)) {
        await tx.insert(schema.alerts).values(user_id.map((id) => ({
            user_id: id,
            message: `<b>${title}</b>\n${message}`,
            alert_type: alert_type,
            article_id: article_id
        })));

        tokens = await tx.select({
            fcm_token: schema.fcm.token
        })
            .from(schema.fcm)
            .where(inArray(schema.fcm.user_id, user_id));
    }
    else {
        await tx.insert(schema.alerts).values({
            user_id: user_id,
            message: `<b>${title}</b>\n${message}`,
            alert_type: alert_type,
            article_id: article_id
        });

        tokens = await tx.select({
            fcm_token: schema.fcm.token
        })
            .from(schema.fcm)
            .where(eq(schema.fcm.user_id, user_id));
    }
    if (tokens.length > 0) {
        getMessaging().sendEachForMulticast({
            data: {
                title: title,
                message: message,
                alert_type: alert_type.toString(),
                article_id: article_id?.toString() ?? ''
            },
            tokens: tokens.map((t) => t.fcm_token)
        })
            .then((response) => {
                if (response.failureCount > 0) {
                    const failed_tokens: string[] = [];
                    response.responses.forEach((resp, idx) => {
                        if (!resp.success) {
                            failed_tokens.push(tokens[idx].fcm_token);
                        }
                    });
                    console.error('Failed to send FCM to tokens:', failed_tokens);
                }
            });
    }
}

export async function register_alert_for_class_students(tx: TX, class_id: number, title: string, message: string, alert_type: number = 0, article_id: number | null = null): Promise<void> {
    const users = await tx.select({
        user_id: schema.studentClasses.user_id,
    })
        .from(schema.studentClasses)
        .where(eq(schema.studentClasses.class_id, class_id));
    // @ts-ignore
    await register_alert(tx, users.map((u) => u.user_id), title, message, alert_type, article_id);
}

export async function register_alert_for_class_teachers(tx: TX, class_id: number, title: string, message: string, alert_type: number = 0, article_id: number | null = null): Promise<void> {
    const users = await tx.select({
        user_id: schema.teacherClasses.user_id,
    })
        .from(schema.teacherClasses)
        .where(eq(schema.teacherClasses.class_id, class_id));
    // @ts-ignore
    await register_alert(tx, users.map((u) => u.user_id), title, message, alert_type, article_id);
}

export async function delete_alert(tx: TX, user_id: number, alert_id: number): Promise<void> {
    await tx.delete(schema.alerts)
        .where(and(eq(schema.alerts.user_id, user_id), eq(schema.alerts.id, alert_id)));
}

export async function delete_alerts_by_article(tx: TX, article_id: number, alert_type: number): Promise<void> {
    await tx.delete(schema.alerts)
        .where(and(eq(schema.alerts.article_id, article_id), eq(schema.alerts.alert_type, alert_type)));
}