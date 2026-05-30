import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const wasmDir = join(root, "node_modules", "@next", "swc-wasm-nodejs");
const nextBin = join(root, "node_modules", "next", "dist", "bin", "next");

const result = spawnSync(process.execPath, [nextBin, "build", "--webpack"], {
  cwd: root,
  env: {
    ...process.env,
    NEXT_TEST_WASM_DIR: wasmDir
  },
  stdio: "inherit"
});

process.exit(result.status ?? 1);
