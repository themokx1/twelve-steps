import fs from "node:fs";
import path from "node:path";

const handlerPath = path.join(process.cwd(), ".open-next/server-functions/default/handler.mjs");
const bundledServerPath = path.join(process.cwd(), ".open-next/server-functions/default/index.mjs");

function patchFile(filePath, patches) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  let source = fs.readFileSync(filePath, "utf8");

  for (const { search, replacement } of patches) {
    if (source.includes(search)) {
      source = source.replace(search, replacement);
    }
  }

  fs.writeFileSync(filePath, source, "utf8");
}

patchFile(handlerPath, [
  {
    search: "getMiddlewareManifest(){return this.minimalMode?null:require(this.middlewareManifestPath)}",
    replacement: "getMiddlewareManifest(){return null}"
  }
]);

patchFile(bundledServerPath, [
  {
    search: "throw Error('Dynamic require of \"' + x + '\" is not supported');",
    replacement:
      "if (typeof x === \"string\" && x.endsWith(\"/middleware-manifest.json\")) return { middleware: {}, functions: {} }; throw Error('Dynamic require of \"' + x + '\" is not supported');"
  }
]);

