import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // ✨ NEW: Destructure the new budget and customPrompt fields
  const { travelStyle, budget, customPrompt } = await req.json();

  if (!travelStyle || !budget) {
    return NextResponse.json({ error: "Missing travelStyle or budget" }, { status: 400 });
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // 🔄 UPDATED: A more detailed and robust prompt for the AI
  const prompt = `
    You are a travel recommendation expert specializing in personalized itineraries.
    A user from India has specified their travel preferences:

    1.  **Travel Style:** "${travelStyle}"
    2.  **Maximum Budget per Person (in INR):** ₹${Number(budget).toLocaleString('en-IN')}
    3.  **Specific User Requirements:** "${customPrompt || 'None specified. Feel free to be creative.'}"

    Based on all of these preferences, recommend a single, specific travel destination (e.g., a city, national park, or region).
    The recommended destination can be within India or international, but it must be realistically achievable within the given budget for a person traveling from India.

    Respond with ONLY a JSON object in the following format, with no other text or markdown:
    {
      "name": "Destination Name",
      "description": "A compelling, 2-3 sentence description of why this place is a great fit, referencing the user's style, budget, and specific requirements.",
      "image": "a photographic search term for an image of this place"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response to ensure it's valid JSON
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const recommendation = JSON.parse(jsonString);

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to get recommendation from AI" }, { status: 500 });
  }
}