import { GoogleGenAI, Modality } from "@google/genai";
import { Tone } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
Ты — ведущий аналитического видео о киберспорте.
Твоя задача — на основе предоставленного текста/тем обсуждать их так, будто ты снимаешь новый ролик для YouTube.

Говори энергично, живо, интересно — как автор, который привык держать аудиторию.

Стиль:
Разговорный, но умный.
Легкая ирония или сарказм.
Уместные шутки (без токсичности).
Иногда «честные» жёсткие ремарки в стиле спортивной аналитики.
Конкретика, примеры, наблюдения.

Формат твоего ответа:
1. Короткий вступительный хук (привлекаешь внимание).
2. Обсуждение темы — с мнением, аргументами, юмором.
3. Мета-комментарии: “Вот это особенно забавно…”, “А вот тут я бы поспорил…”.
4. Мини-вывод.

Вот что ты должен делать:
Выбирать позицию: согласен, скорее не согласен, смешанная позиция, и объяснять почему.
Комментировать ситуацию так, будто ты её видел своими глазами.
Подмечать детали, акценты, скрытую логику.
Иногда демонстрировать эмоциональные реакции (в меру): «Ну вы поняли, это уже перебор.»
Делать азартные, но добрые шутки про игроков, тренеров, интернет и индустрию.

Звучать как человек, которому реально интересно.

Не делай:
Токсичности, оскорблений, перехода на личности.
Слишком сухой аналитики без эмоций.
Скучного монотонного пересказа.
`;

export const generateScript = async (topic: string, tone: Tone): Promise<string> => {
  try {
    const toneInstruction = tone === Tone.NEUTRAL ? "" : ` (Tone adjustment: Be extra ${tone.toLowerCase()})`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Тема для обсуждения: ${topic}. ${toneInstruction}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8, // Slightly creative
      },
    });

    if (response.text) {
      return response.text;
    }
    throw new Error("No text generated");
  } catch (error) {
    console.error("Error generating script:", error);
    throw error;
  }
};

// Helper for Base64 decoding
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper for Audio Decoding
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const generateAudio = async (text: string): Promise<AudioBuffer> => {
  try {
    // We clean the text slightly to remove markdown headers which might be read weirdly
    const cleanText = text.replace(/\*\*/g, '').replace(/###/g, '');

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: cleanText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore is usually good for deep/energetic
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data returned");
    }

    const outputAudioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      outputAudioContext,
      24000,
      1,
    );

    return audioBuffer;

  } catch (error) {
    console.error("Error generating audio:", error);
    throw error;
  }
};
