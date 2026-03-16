import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extract text from PDF buffer
 */
export const extractTextFromPdf = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (error) {
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
};

/**
 * Extract text from DOCX buffer
 */
export const extractTextFromDocx = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  } catch (error) {
    throw new Error(`DOCX extraction failed: ${error.message}`);
  }
};

/**
 * Extract text from TXT buffer
 */
export const extractTextFromTxt = async (buffer) => {
  try {
    return buffer.toString('utf-8');
  } catch (error) {
    throw new Error(`TXT extraction failed: ${error.message}`);
  }
};

/**
 * Extract text from PPTX using a simple approach
 */
export const extractTextFromPptx = async (buffer) => {
  try {
    // PPTX is a ZIP file, we can extract text by reading the XML files
    const AdmZip = (await import('adm-zip')).default;
    const zip = new AdmZip(buffer);
    let text = '';

    const entries = zip.getEntries();
    entries.forEach((entry) => {
      if (entry.entryName.includes('slide') && entry.entryName.endsWith('.xml')) {
        const content = entry.getData().toString('utf8');
        // Simple regex to extract text from XML
        const matches = content.match(/<a:t>([^<]*)<\/a:t>/g);
        if (matches) {
          matches.forEach((match) => {
            const textContent = match.replace(/<a:t>|<\/a:t>/g, '');
            if (textContent.trim()) {
              text += textContent + ' ';
            }
          });
        }
      }
    });

    return text || 'No text found in presentation';
  } catch (error) {
    throw new Error(`PPTX extraction failed: ${error.message}`);
  }
};

/**
 * Generic file extraction based on MIME type
 */
export const extractTextFromFile = async (buffer, mimeType, fileName) => {
  switch (mimeType) {
    case 'application/pdf':
      return await extractTextFromPdf(buffer);

    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/msword':
      return await extractTextFromDocx(buffer);

    case 'text/plain':
      return await extractTextFromTxt(buffer);

    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    case 'application/vnd.ms-powerpoint':
      return await extractTextFromPptx(buffer);

    case 'text/csv':
      return await extractTextFromTxt(buffer);

    case 'application/json':
      return await extractTextFromTxt(buffer);

    default:
      // Try as text for unknown types
      try {
        return await extractTextFromTxt(buffer);
      } catch {
        throw new Error(`Unsupported file type: ${mimeType}`);
      }
  }
};

/**
 * Get file size in MB
 */
export const getFileSizeInMb = (bytes) => {
  return (bytes / (1024 * 1024)).toFixed(2);
};

/**
 * Get supported file types
 */
export const getSupportedFileTypes = () => {
  return {
    'application/pdf': { ext: 'pdf', label: 'PDF Document' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
      ext: 'docx',
      label: 'Word Document',
    },
    'application/msword': { ext: 'doc', label: 'Word Document' },
    'text/plain': { ext: 'txt', label: 'Text File' },
    'text/csv': { ext: 'csv', label: 'CSV File' },
    'application/json': { ext: 'json', label: 'JSON File' },
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
      ext: 'pptx',
      label: 'PowerPoint Presentation',
    },
    'application/vnd.ms-powerpoint': { ext: 'ppt', label: 'PowerPoint Presentation' },
  };
};

/**
 * Validate file
 */
export const validateFile = (file) => {
  const supportedTypes = getSupportedFileTypes();
  const maxSizeBytes = 50 * 1024 * 1024; // 50MB

  if (!file) {
    throw new Error('No file provided');
  }

  if (!supportedTypes[file.mimetype]) {
    const supported = Object.values(supportedTypes)
      .map((t) => t.label)
      .join(', ');
    throw new Error(`Unsupported file type. Supported: ${supported}`);
  }

  if (file.size > maxSizeBytes) {
    throw new Error(`File size exceeds 50MB limit. Current size: ${getFileSizeInMb(file.size)}MB`);
  }

  return true;
};
