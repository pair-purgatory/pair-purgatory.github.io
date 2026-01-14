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
        const replace = {};

        const meta = await (
            Glob(Path.join(story, dir, "metadata.yaml"))
            .then(path => FileSystem.readFile(path, "utf8"))
            .then(file => YAML.parse(file))
        );

        replace.meta = {
            series: "Pair Purgatory",
            title: meta.title,
            author: meta.author
        };

        replace.page = {
            styles: "<!-- styles go here -->",
            scripts: "<!-- scripts go here -->"
        };

        Promise.all(meta.content.map(item => FileSystem.readFile(
            Path.join(story, dir, "content", item)
        ))).then(
            content => replace.content = content.join("\n")
        );

        const page = template.replace(regex, (match, path) => {
            // https://github.com/chiptumor/chiptumor.github.io/blob/main/build/plugin/replace-templates.js
        });
    }
});
