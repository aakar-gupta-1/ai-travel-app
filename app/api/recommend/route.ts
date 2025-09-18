import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { travelStyle, budget } = await req.json();

  if (!travelStyle || !budget) {
    return NextResponse.json({ error: "Missing travelStyle or budget" }, { status: 400 });
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are a travel recommendation expert. A user has specified their preferences:
    - Travel Style: ${travelStyle}
    - Budget: ${budget}

    Recommend a single, specific travel destination (e.g., a city, not a country).

    Respond with ONLY a JSON object in the following format, no other text or markdown:
    {
      "name": "Destination Name",
      "description": "A compelling, 2-3 sentence description of why this place is a great fit.",
      "image": "a search term for an image of this place"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const recommendation = JSON.parse(jsonString);

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to get recommendation from AI" }, { status: 500 });
  }
}