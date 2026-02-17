import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const knowledgeDir = path.join(__dirname, '..', 'data', 'knowledge');

if (!fs.existsSync(knowledgeDir)) {
  fs.mkdirSync(knowledgeDir, { recursive: true });
}

const getUserKnowledgePath = (userId) =>
  path.join(knowledgeDir, `${userId}.txt`);

export const appendKnowledge = async (userId, text, sourceName = 'PDF') => {
  if (!text || !text.trim()) return;

  const filePath = getUserKnowledgePath(userId);
  const header = `\n\n===== NEW DOCUMENT: ${sourceName} - ${new Date().toISOString()} =====\n\n`;
  await fs.promises.appendFile(filePath, header + text.trim());
};

export const loadKnowledge = async (userId, maxChars = 6000) => {
  try {
    const filePath = getUserKnowledgePath(userId);
    const content = await fs.promises.readFile(filePath, 'utf8');
    // Take the last maxChars characters to keep most recent docs
    return content.slice(-maxChars);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return '';
    }
    throw error;
  }
};

