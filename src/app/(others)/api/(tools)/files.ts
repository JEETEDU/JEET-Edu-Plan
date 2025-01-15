import * as fs from "node:fs";

export function save_files(files: FileList): string[] {
    let save_path = 'uploads/files'
    let url_path = '/file'
    let files_path: string[] = [];
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        if (!file) continue;
        let file_name = Math.random().toString(36).substring(2, 15) + '.' + file.name.split('.').pop();
        let file_path = save_path + '/' + file_name;
        files_path.push(url_path + '/' + file_name);
        file.arrayBuffer().then((buffer) => {
            fs.writeFileSync(file_path, Buffer.from(buffer));
        });
    }
    return files_path;
}