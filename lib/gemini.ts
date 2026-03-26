import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { z } from "zod";

const analysisSchema = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      quantity: z.string(),
      calories: z.number().nonnegative(),
    }),
  ),
});

function getUnavailableAnalysis(itemNames: string[]) {
  return itemNames.map((name) => ({
    name,
    quantity: "Unable to estimate",
    calories: 0,
  }));
}

function parseJsonResponse(text: string) {
  const normalized = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(normalized);
}

export async function analyzeMealItems(input: {
  itemNames: string[];
  imageFiles: Array<{
    mimeType: string;
    data: string;
  }>;
}) {
  if (!process.env.GEMINI_API_KEY) {
    return getUnavailableAnalysis(input.itemNames);
  }

  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const modelName = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  const model = client.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          items: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING },
                quantity: { type: SchemaType.STRING },
                calories: { type: SchemaType.NUMBER },
              },
              required: ["name", "quantity", "calories"],
            },
          },
        },
        required: ["items"],
      },
      temperature: 0.2,
    },
  });
  const prompt = `
You estimate food quantities and calories for a meal log.
Return strict JSON only.
Use the provided meal names as the source of truth.
If images are attached, use them to improve quantity and calorie estimates.
Items: ${input.itemNames.join(", ")}
`;
  try {
    const parts = [
      { text: prompt },
      ...input.imageFiles.map((file) => ({
        inlineData: {
          mimeType: file.mimeType,
          data: file.data,
        },
      })),
    ];
    const result = await model.generateContent(parts);
    const text = result.response.text();
    const parsed = analysisSchema.parse(parseJsonResponse(text));

    return parsed.items;
  } catch (error) {
    console.warn(
      `Gemini meal analysis failed for model "${modelName}". Marking estimates as unavailable.`,
      error,
    );
    return getUnavailableAnalysis(input.itemNames);
  }
}
