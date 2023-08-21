import OpenAI from "openai";
import { Clue } from "../models/Puzzle";

const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true,
});

export const dumbDownClue = async (clue: Clue): Promise<string | null> => {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: "Say this is a test" }],
    model: "gpt-3.5-turbo",
  });

  return completion.choices[0].message.content;
};
