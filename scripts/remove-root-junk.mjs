import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");

for (const name of ["node_modules", ".next"]) {
  const target = path.join(repoRoot, name);
  if (!fs.existsSync(target)) continue;
  try {
    fs.rmSync(target, { recursive: true, force: true });
    console.log("Removed:", target);
  } catch (e) {
    console.error("Could not remove", target);
    console.error(e.message);
    console.error("\nStop npm run dev (and close terminals using this project), then run:");
    console.error("  npm run clean-root --prefix client");
    process.exitCode = 1;
  }
}
