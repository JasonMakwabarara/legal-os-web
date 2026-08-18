import fs from "node:fs";
import path from "node:path";

const trpcRoot = path.resolve(import.meta.dirname, "../node_modules/@trpc");

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith(".d.mts")) files.push(full);
  }
  return files;
}

function resolveImport(fromFile, spec) {
  const target = path.resolve(path.dirname(fromFile), spec);
  return {
    mjs: target,
    dmts: target.replace(/\.mjs$/i, ".d.mts"),
  };
}

let changed = 0;
for (const pkg of ["server", "client", "react-query"]) {
  const files = walk(path.join(trpcRoot, pkg, "dist"));
  for (const file of files) {
    const original = fs.readFileSync(file, "utf8");
    const next = original.replace(/from (["'])([^"']+\.mjs)\1/g, (match, quote, spec) => {
      const { mjs, dmts } = resolveImport(file, spec);
      if (!fs.existsSync(mjs) && fs.existsSync(dmts)) {
        return `from ${quote}${spec.replace(/\.mjs$/i, ".d.mts")}${quote}`;
      }
      return match;
    }).replace(/import (["'])([^"']+\.mjs)\1/g, (match, quote, spec) => {
      const { mjs, dmts } = resolveImport(file, spec);
      if (!fs.existsSync(mjs) && fs.existsSync(dmts)) {
        return `import ${quote}${spec.replace(/\.mjs$/i, ".d.mts")}${quote}`;
      }
      return match;
    });
    if (next !== original) {
      fs.writeFileSync(file, next);
      changed += 1;
    }
  }
}

if (changed > 0) {
  console.log(`Fixed ${changed} tRPC declaration files (types pointed at missing .mjs chunks).`);
}
