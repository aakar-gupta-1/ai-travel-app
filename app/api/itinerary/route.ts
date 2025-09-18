import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { destinationName, travelStyles, budget, numPeople, customPrompt } = await req.json();

  if (!destinationName) {
    return NextResponse.json({ error: "Missing destinationName" }, { status: 400 });
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are an expert travel planner. Create a suggested 3-day itinerary for a group of ${numPeople} people traveling to ${destinationName}.

    Their travel profile is as follows:
    - **Desired Vibe/Styles:** ${travelStyles.join(', ')}
    - **Total Budget for the Group:** ₹${Number(budget).toLocaleString('en-IN')}
    - **Other User Notes:** "${customPrompt || 'None'}"

    The itinerary should be practical and inspiring. Include a mix of activities, potential dining spots (catering to different tastes), and logistical tips. The tone should be exciting and helpful.

    Format the response as a single block of text. Use markdown for headings (e.g., '## Day 1: Arrival and Exploration') and bullet points for activities. Do not wrap the response in a JSON object or markdown code block.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const itineraryText = response.text();

    return NextResponse.json({ itinerary: itineraryText });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create itinerary" }, { status: 500 });
  }
}