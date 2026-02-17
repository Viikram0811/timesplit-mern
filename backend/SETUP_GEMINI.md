# Gemini API Setup

## API Key Configuration

Your Gemini API key: `AIzaSyDlA6cslLDYrb7TJdQwPL87slUSTqBtHNM`

## Setup Steps

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Gemini API key to `.env`:
   ```env
   GEMINI_API_KEY=AIzaSyDlA6cslLDYrb7TJdQwPL87slUSTqBtHNM
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. The application will now use Gemini 2.0 Flash Lite model for:
   - AI-powered schedule generation
   - Chatbot responses

## Model Used

- **Model**: `gemini-2.0-flash-lite`
- **Package**: `@google/generative-ai`

## Note

Keep your API key secure and never commit it to version control!
