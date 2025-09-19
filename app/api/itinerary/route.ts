import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { destinationName, travelStyles, budget, numPeople, customPrompt } = await req.json();

  if (!destinationName) {
    return NextResponse.json({ error: "Missing destinationName" }, { status: 400 });
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // 🔄 UPDATED PROMPT: Added instructions for AI to prefix activities with keywords for icon mapping.
  const prompt = `
    You are an expert travel planner. Create the best possible, detailed itinerary for a group of ${numPeople} people traveling to ${destinationName}.

    Their travel profile is as follows:
    - **Total Budget for the Group:** ₹${Number(budget).toLocaleString('en-IN')}.
    - **Desired Vibe/Styles:** ${travelStyles.join(', ')}
    - **Other User Notes:** "${customPrompt || 'None'}"

    Determine the optimal duration for the trip based on the destination and budget. State the recommended duration clearly at the beginning.

    Format the response using markdown. For each list item, YOU MUST start the line with a keyword followed by a colon to hint at the activity type. Use these keywords:
    - **"Food:"** for dining, cafes, or culinary experiences.
    - **"Activity:"** for sightseeing, tours, events, or general actions.
    - **"Stay:"** for lodging or accommodation details.
    - **"Tip:"** for helpful advice, notes, or transportation info.

    Example of a list item:
    - Activity: Explore the ancient ruins of the Vijayanagara Empire.
    - Food: Enjoy a traditional South Indian thali for lunch.
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