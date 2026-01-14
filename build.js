import * as Path from "node:path";
import { glob as Glob } from "glob";
import * as FileSystem from "node:fs/promises";

import YAML from "yaml";

const dist = Path.resolve("./dist/");
await FileSystem.rm(dist, {
    recursive: true,
    force: true
});
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
            .then(path => FileSystem.readFile(path[0], "utf8"))
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

        await Promise.all(
            meta.content.map(item => FileSystem.readFile(
                Path.join(story, dir, "content", item), "utf8"
            ))
        ).then(content => replace.content = 
            "<article>\n" +
            content.join(
                " ".repeat(8) + "</article>" + "\n" +
                " ".repeat(8) + "<article>" + "\n"
            ) +
            " ".repeat(8) + "</article>"
        );

        const page = template.replace(regex, (match, path) => 
            path.split(".").reduce(
                (obj, key) => obj?.[key] ?? match,
                replace
            )
        );

        const episode = Path.join(dist, meta.path)
        await FileSystem.mkdir(episode, { recursive: true });

        FileSystem.writeFile(Path.join(episode, "index.html"), page);
    }
});
