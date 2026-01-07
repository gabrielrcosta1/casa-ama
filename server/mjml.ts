import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mjml2html from 'mjml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function renderMjml(templateName: string, variables: Record<string, string | number> = {}): string {
  const templatePath = path.resolve(__dirname, 'templates', `${templateName}.mjml`);
  const raw = fs.readFileSync(templatePath, 'utf8');
  const populated = replaceVariables(raw, variables);
  const { html, errors } = mjml2html(populated, { validationLevel: 'soft' });
  if (errors && errors.length > 0) {
    // Log but continue with generated HTML
    console.error('MJML validation warnings:', errors);
  }
  return html;
}

function replaceVariables(source: string, variables: Record<string, string | number>): string {
  let result = source;
  for (const [key, value] of Object.entries(variables)) {
    const re = new RegExp(`{{\\s*${escapeRegExp(key)}\\s*}}`, 'g');
    result = result.replace(re, String(value));
  }
  // Remove any leftover placeholders
  result = result.replace(/{{\s*[\w.-]+\s*}}/g, '');
  return result;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


