import { Router } from "express";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const router = Router();

const __dirname = dirname(fileURLToPath(import.meta.url));
const specPath = join(__dirname, "../../openapi.json");

router.get("/openapi.json", (_req, res) => {
  if (!existsSync(specPath)) {
    res.status(404).json({
      error: "OpenAPI spec not found. Run 'npm run generate:openapi' to generate it.",
    });
    return;
  }

  const spec = JSON.parse(readFileSync(specPath, "utf-8"));
  res.json(spec);
});

export default router;
