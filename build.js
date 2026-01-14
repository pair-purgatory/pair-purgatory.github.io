import * as Path from "node:path";
import { glob as Glob } from "glob";
import * as FileSystem from "node:fs/promises";

import YAML from "yaml";

const dist = Path.resolve("./dist/");
await FileSystem.mkdir(dist);

const story = Path.resolve("./src/story/");
FileSystem.readdir(story).then(async dirs => {
    const template = await FileSystem.readFile(
        Path.resolve("./include/episode-template.html"),
    "utf8");
    const regex = /\{\{\s*([\w.]+)\s*\}\}/g;

    for (const dir of dirs) {

    }
});
