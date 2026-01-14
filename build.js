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

await FileSystem.cp(Path.resolve("./public/"), dist, {
    recursive: true,
    force: true
});

const story = Path.resolve("./src/story/");
FileSystem.readdir(story).then(async dirs => {
    const template = await FileSystem.readFile(
        Path.resolve("./include/episode-template.html"),
    "utf8");
    const regex = /\{\{\s*([\w.]+)\s*\}\}/g;

    for (const dir of dirs) {
        const replace = {};

        const meta = await (
            FileSystem.readFile(Path.join(story, dir, "metadata.yaml"), "utf8")
            .then(YAML.parse)
        );

        replace.meta = {
            series: "Pair Purgatory",
            title: meta.title,
            author: meta.author
        };

        await Promise.all(
            meta.content.map(item => FileSystem.readFile(
                Path.join(story, dir, "content", item), "utf8"
            ))
        ).then(content => replace.content = 
            "<article>\n" +
            content.join(
                " ".repeat(8) + "</article>\n" +
                " ".repeat(8) + "<article>\n"
            ) +
            " ".repeat(8) + "</article>"
        );
        
        const resource = {};
        resource.css = await FileSystem.readFile(Path.join(story, dir, "style.css"), "utf8").catch(() => null);
        resource.js = await FileSystem.readFile(Path.join(story, dir, "script.js"), "utf8").catch(() => null);

        replace.page = {};
        
        replace.page.css = resource.css
            ? "<link rel=\"stylesheet\" href=\"./resource/style.css\" />"
            : "<!-- no unique css -->";
        replace.page.js = resource.js
            ? "<script src=\"./resource/script.js\"></script>"
            : "<!-- no unique javascript -->";
        
        const html = template.replace(regex, (match, path) => 
            path.split(".").reduce(
                (obj, key) => obj?.[key] ?? match,
                replace
            )
        );

        const episode = Path.join(dist, meta.path);

        await FileSystem.mkdir(episode, { recursive: true });
        FileSystem.writeFile(Path.join(episode, "index.html"), html);

        await FileSystem.mkdir(Path.join(episode, "resource"));
        if (resource.css) FileSystem.writeFile(Path.join(episode, "resource/style.css"), resource.css);
        if (resource.js) FileSystem.writeFile(Path.join(episode, "resource/script.js"), resource.js);
    }
});
