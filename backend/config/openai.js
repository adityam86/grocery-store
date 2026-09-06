import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

export default openai;
