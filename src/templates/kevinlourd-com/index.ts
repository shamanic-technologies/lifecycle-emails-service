import type { TemplateResult } from "../index.js";
import { welcome } from "./welcome.js";

export const templates: Record<string, (metadata?: Record<string, unknown>) => TemplateResult> = {
  welcome,
};
