import OpenAI from 'openai';
import { OPENAI_API_KEY } from '@env';

if (!OPENAI_API_KEY) {
  console.warn('OpenAI API key is missing. Please add it to your .env file.');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export const getOpenAIResponse = async (prompt: string): Promise<string | null> => {
  if (!OPENAI_API_KEY) {
    return 'Greška: OpenAI API ključ nije podešen. Molim vas, dodajte ga u .env fajl.';
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // You can change the model if needed
      messages: [{ role: 'user', content: prompt }],
    });

    return completion.choices[0]?.message?.content;
  } catch (error) {
    console.error('Error fetching response from OpenAI:', error);
    return 'Izvinjavam se, došlo je do greške prilikom komunikacije sa AI asistentom.';
  }
};
