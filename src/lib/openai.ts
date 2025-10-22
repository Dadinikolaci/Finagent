import OpenAI from 'openai';
import { OPENAI_API_KEY as ENV_API_KEY } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY_STORAGE_KEY = '@openai_api_key';

let openai: OpenAI;

// Function to initialize or re-initialize the OpenAI client
export const initializeOpenAI = async () => {
  const storedApiKey = await AsyncStorage.getItem(API_KEY_STORAGE_KEY);
  const apiKey = storedApiKey || ENV_API_KEY;

  if (!apiKey) {
    console.warn('OpenAI API key is missing. Please add it via Settings or to your .env file.');
    openai = null; // Set to null if no key is available
    return;
  }

  openai = new OpenAI({
    apiKey,
  });
};

// Initialize on startup
initializeOpenAI();

export const getOpenAIResponse = async (prompt: string): Promise<string | null> => {
  if (!openai) {
    return 'Greška: OpenAI API ključ nije podešen. Molimo vas, dodajte ga u ekranu "Podešavanja".';
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    return completion.choices[0]?.message?.content;
  } catch (error) {
    console.error('Error fetching response from OpenAI:', error);
    if (error.response?.status === 401) {
        return 'Greška: OpenAI API ključ nije validan. Proverite ga u podešavanjima.';
    }
    return 'Izvinjavam se, došlo je do greške prilikom komunikacije sa AI asistentom.';
  }
};
