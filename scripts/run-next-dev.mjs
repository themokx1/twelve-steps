import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function parseDotenv(source) {
  const result = {};

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);

    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    let value = rawValue.trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    value = value
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t");

    result[key] = value;
  }

  return result;
}

function loadLocalSecrets() {
  const envPath = path.join(process.cwd(), ".dev.vars");

  if (!fs.existsSync(envPath)) {
    return {};
  }

  const source = fs.readFileSync(envPath, "utf8");
  const parsed = parseDotenv(source);

  console.log(`Loaded local secrets from ${envPath}`);

  return parsed;
}

const nextBin = require.resolve("next/dist/bin/next");
const env = {
  ...process.env,
  ...loadLocalSecrets()
};

const child = spawn(process.execPath, [nextBin, "dev"], {
  cwd: process.cwd(),
  env,
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
