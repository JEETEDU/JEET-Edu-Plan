import * as fs from "node:fs";
import {MySqlTransaction} from "drizzle-orm/mysql-core";
import * as schema from "@/database/schema";
import {eq} from "drizzle-orm";

const save_path = 'uploads/files'
const url_path = '/file'

export type SavedFileList = { name: string, path: string }[];
type TX = MySqlTransaction<any, any, any, any>;

export async function save_files(tx: TX, files: FileList): Promise<SavedFileList> {
    const files_path: SavedFileList = [];
    for (const file of files) {
        if (!file.name) continue;
        const file_name = Math.random().toString(36).substring(2, 15);
        const file_ext = '.' + file.name.split('.').pop();
        const file_path = save_path + '/' + file_name + file_ext;
        files_path.push({
            name: file.name,
            path: url_path + '/' + file_name + file_ext
        });
        file.arrayBuffer().then((buffer) => {
            fs.writeFileSync(file_path, Buffer.from(buffer));
        });
        await tx.insert(schema.files).values({
            id: file_name,
            name: file.name
        });
    }
    return files_path;
}

export async function update_files(tx: TX, files: FileList, original: SavedFileList, edited: SavedFileList): Promise<SavedFileList> {
    const files_path: SavedFileList = edited;
    for (const file of files) {
        if (!file.name) continue;
        const file_name = Math.random().toString(36).substring(2, 15);
        const file_ext = '.' + file.name.split('.').pop();
        const file_path = save_path + '/' + file_name + file_ext;
        files_path.push({
            name: file.name,
            path: url_path + '/' + file_name + file_ext
        });
        file.arrayBuffer().then((buffer) => {
            fs.writeFileSync(file_path, Buffer.from(buffer));
        });
        await tx.insert(schema.files).values({
            id: file_name,
            name: file.name
        });
    }
    if (!original) return files_path
    for (const file of original) {
        if (!files_path.some((f) => f.path === file.path)) {
            fs.unlink(save_path + '/' + file.path.split('/').pop(), (err) => {
                if (err) console.error(err);
            });
            await tx.delete(schema.files)
                .where(eq(schema.files.id, file.path.split('/').pop()?.split('.').shift() ?? ''));
        }
    }
    return files_path;
}

export async function delete_files(tx: TX, files: SavedFileList) {
    for (const file of files) {
        fs.unlink(save_path + '/' + file.path.split('/').pop(), (err) => {
            if (err) console.error(err);
        });
        await tx.delete(schema.files)
            .where(eq(schema.files.id, file.path.split('/').pop()?.split('.').shift() ?? ''));
    }
}