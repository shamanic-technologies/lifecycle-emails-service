import type { TemplateResult } from "../index.js";
import { webinarWelcome } from "./webinar-welcome.js";
import { jMinus3 } from "./j-minus-3.js";
import { jMinus2 } from "./j-minus-2.js";
import { jMinus1 } from "./j-minus-1.js";
import { jDay } from "./j-day.js";

export const templates: Record<string, (metadata?: Record<string, unknown>) => TemplateResult> = {
  webinar_welcome: webinarWelcome,
  j_minus_3: jMinus3,
  j_minus_2: jMinus2,
  j_minus_1: jMinus1,
  j_day: jDay,
};
