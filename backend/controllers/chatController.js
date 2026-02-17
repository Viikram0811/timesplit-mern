import dotenv from 'dotenv';
dotenv.config();

import ChatHistory from '../models/ChatHistory.js';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Helper function to retry with exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isRateLimit = error.status === 429 || error.code === 429 || 
                          (error.message && error.message.includes('429'));
      
      if (isRateLimit && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Rate limit hit. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};

// @desc    Send message to chatbot
// @route   POST /api/chat
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    console.log('📨 API HIT - Chat message received'); // Debug log to detect double requests

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message'
      });
    }

    // Get or create chat history
    let chatHistory = await ChatHistory.findOne({ user: req.user.id });

    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        user: req.user.id,
        messages: []
      });
    }

    // Add user message
    chatHistory.messages.push({
      role: 'user',
      content: message
    });

    // Get AI response
    let aiResponse = 'I apologize, but I am currently unavailable. Please check your Gemini API configuration.';

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
      try {
        // Prepare messages for Gemini (last 10 messages for context)
        const recentMessages = chatHistory.messages.slice(-10);
        
        // Build conversation history for Gemini
        let conversationText = 'You are a helpful academic assistant for students. Help them with their studies, answer questions, provide study tips, and assist with academic planning. Be friendly, encouraging, and educational.\n\n';
        
        recentMessages.forEach(msg => {
          if (msg.role === 'user') {
            conversationText += `User: ${msg.content}\n`;
          } else {
            conversationText += `Assistant: ${msg.content}\n`;
          }
        });
        
        conversationText += 'Assistant:';

        const model = 'gemini-2.5-flash';
        
        // Use retry logic for rate limit handling (non-streaming)
        const response = await retryWithBackoff(async () => {
          return await ai.models.generateContent({
            model,
            contents: [
              {
                role: 'user',
                parts: [{ text: conversationText }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
              topK: 64,
              // Keep this reasonably sized for chat to reduce quota usage while testing.
              maxOutputTokens: 1024,
            },
          });
        });

        aiResponse = (response?.text || '').trim();
      } catch (error) {
        console.error('Gemini API error:', error);
        
        // Better error messages for rate limits
        const isRateLimit = error.status === 429 || error.code === 429 || 
                           (error.message && error.message.includes('429'));
        
        if (isRateLimit) {
          aiResponse = '⚠️ Rate limit reached. Please wait a moment and try again. The AI service is temporarily busy.';
        } else {
          aiResponse = 'I encountered an error processing your request. Please try again later.';
        }
      }
    }

    // Add AI response
    chatHistory.messages.push({
      role: 'assistant',
      content: aiResponse
    });

    await chatHistory.save();

    res.status(200).json({
      success: true,
      response: aiResponse,
      chatHistory: chatHistory.messages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chat history
// @route   GET /api/chat
// @access  Private
export const getChatHistory = async (req, res, next) => {
  try {
    const chatHistory = await ChatHistory.findOne({ user: req.user.id });

    if (!chatHistory) {
      return res.status(200).json({
        success: true,
        messages: []
      });
    }

    res.status(200).json({
      success: true,
      messages: chatHistory.messages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear chat history
// @route   DELETE /api/chat
// @access  Private
export const clearChatHistory = async (req, res, next) => {
  try {
    await ChatHistory.findOneAndUpdate(
      { user: req.user.id },
      { messages: [], updatedAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: 'Chat history cleared'
    });
  } catch (error) {
    next(error);
  }
};
