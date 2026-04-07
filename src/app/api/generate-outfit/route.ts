import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type WardrobeItem = {
  id: string;
  name: string;
  category: string;
  color: string;
  style: string;
  description: string;
};

export async function POST(request: NextRequest) {
  const { wardrobeItems }: { wardrobeItems: WardrobeItem[] } = await request.json();

  if (!wardrobeItems || wardrobeItems.length < 2) {
    return NextResponse.json({ error: "Need at least 2 wardrobe items to generate outfits" }, { status: 400 });
  }

  const wardrobeList = wardrobeItems
    .map(item => `- ID: ${item.id} | ${item.name} (${item.category}) | Color: ${item.color} | Style: ${item.style}`)
    .join("\n");

  const message = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a personal stylist. Here is someone's wardrobe:

${wardrobeList}

Create 3 outfit combinations they likely haven't thought to try. Focus on unexpected but wearable pairings. Respond with ONLY valid JSON:
{
  "outfits": [
    {
      "item_ids": ["id1", "id2", "id3"],
      "explanation": "Why this outfit works and when to wear it (2-3 sentences)"
    }
  ],
  "shopping_recommendations": "2-3 sentences on what types of items would most expand their outfit options based on what they own"
}`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Failed to parse Claude response", raw: text }, { status: 500 });
  }
}
