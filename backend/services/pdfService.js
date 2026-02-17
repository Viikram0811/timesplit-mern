import pdfParse from 'pdf-parse';

export const extractTextFromPdfBuffer = async (buffer) => {
  const data = await pdfParse(buffer);
  // pdf-parse returns { text, info, metadata, ... }
  return data.text || '';
};

