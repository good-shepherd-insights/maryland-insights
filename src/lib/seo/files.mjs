import { existsSync } from "node:fs";
import { join } from "node:path";

/** Whether ImageMod can show this path: the same folder and types as its glob. */
export const imageExists = (path) => /^\/images\/.+\.(jpeg|jpg|png|gif|svg|webp|avif)$/.test(path) && existsSync(join(process.cwd(), "public", path));
