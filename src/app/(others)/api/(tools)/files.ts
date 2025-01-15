import * as fs from "node:fs";

const save_path = 'uploads/files'
const url_path = '/file'

export function save_files(files: FileList): string[] {
    let files_path: string[] = [];
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        if (!file.name) continue;
        let file_name = Math.random().toString(36).substring(2, 15) + '.' + file.name.split('.').pop();
        let file_path = save_path + '/' + file_name;
        files_path.push(url_path + '/' + file_name);
        file.arrayBuffer().then((buffer) => {
            fs.writeFileSync(file_path, Buffer.from(buffer));
        });
    }
    return files_path;
}

export function update_files(files: FileList, original: string[], edited: string[]) {
    let files_path: string[] = edited;
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        if (!file.name) continue;
        let file_name = Math.random().toString(36).substring(2, 15) + '.' + file.name.split('.').pop();
        let file_path = save_path + '/' + file_name;
        files_path.push(url_path + '/' + file_name);
        file.arrayBuffer().then((buffer) => {
            fs.writeFileSync(file_path, Buffer.from(buffer));
        });
    }
    if (!original) return files_path
    for (let i = 0; i < original.length; i++) {
        if (!files_path.includes(original[i])) {
            fs.unlink(save_path + '/' + original[i].split('/').pop(), (err) => {
                if (err) console.error(err);
            });
        }
    }
    return files_path;
}