import * as mcpfactory from "./mcpfactory/index.js";

export interface TemplateResult {
  subject: string;
  htmlBody: string;
  textBody: string;
}

type TemplateFn = (metadata?: Record<string, unknown>) => TemplateResult;

const registry: Record<string, Record<string, TemplateFn>> = {
  mcpfactory: mcpfactory.templates,
};

export function getTemplate(appId: string, eventType: string): TemplateFn {
  const appTemplates = registry[appId];
  if (!appTemplates) {
    throw new Error(`No templates registered for app: ${appId}`);
  }
  const template = appTemplates[eventType];
  if (!template) {
    throw new Error(`No template for event '${eventType}' in app '${appId}'`);
  }
  return template;
}
