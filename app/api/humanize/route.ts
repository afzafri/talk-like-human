import { NextRequest, NextResponse } from "next/server";
import { createProvider } from "@/lib/llm";
import { loadSkill, buildSystemPrompt } from "@/lib/skillLoader";

const MAX_INPUT_LENGTH = 3000;

const TONE_INSTRUCTIONS: Record<string, string> = {
  casual: "Rewrite in a casual, relaxed tone.",
  professional: "Rewrite in a professional tone.",
  academic: "Rewrite in an academic tone.",
  confident: "Rewrite in a confident, assertive tone.",
  friendly: "Rewrite in a friendly, warm tone.",
};

export async function POST(req: NextRequest) {
  let body: { text?: string; tone?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const text = body?.text?.trim();

  if (!text) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  if (text.length > MAX_INPUT_LENGTH) {
    return NextResponse.json(
      { error: `Text exceeds maximum length of ${MAX_INPUT_LENGTH} characters` },
      { status: 400 }
    );
  }

  const toneKey = body?.tone && TONE_INSTRUCTIONS[body.tone] ? body.tone : null;
  const userInput = toneKey
    ? `${text}\n\nAdditional instruction: ${TONE_INSTRUCTIONS[toneKey]}`
    : text;

  try {
    const skillContent = await loadSkill();
    const systemPrompt = buildSystemPrompt(skillContent);
    const provider = createProvider();
    const result = await provider.generate(systemPrompt, userInput);

    return NextResponse.json({ result });
  } catch (err) {
    console.error("[/api/humanize] Error:", err);
    return NextResponse.json(
      { error: "Failed to humanize text. Please try again." },
      { status: 500 }
    );
  }
}
