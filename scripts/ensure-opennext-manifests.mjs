import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const nextRoot = path.join(root, ".next");
const standaloneNextRoot = path.join(root, ".next/standalone/.next");

if (!fs.existsSync(nextRoot)) {
  process.exit(0);
}

fs.mkdirSync(standaloneNextRoot, { recursive: true });

for (const entry of fs.readdirSync(nextRoot, { withFileTypes: true })) {
  if (["cache", "standalone", "trace"].includes(entry.name)) continue;
  const source = path.join(nextRoot, entry.name);
  const target = path.join(standaloneNextRoot, entry.name);

  if (entry.isDirectory()) {
    fs.cpSync(source, target, {
      recursive: true,
      force: false
    });
  } else if (!fs.existsSync(target)) {
    fs.copyFileSync(source, target);
  }
}

const pagesManifest = path.join(standaloneNextRoot, "server/pages-manifest.json");
if (!fs.existsSync(pagesManifest)) {
  fs.mkdirSync(path.dirname(pagesManifest), { recursive: true });
  fs.writeFileSync(pagesManifest, "{}\n", "utf8");
}

