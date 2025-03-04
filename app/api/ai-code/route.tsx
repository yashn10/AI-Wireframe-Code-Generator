import { NextRequest, NextResponse } from "next/server";
import Constants from "@/data/Constants";

export async function POST(req: NextRequest) {
    console.log("API endpoint /api/ai-code called");
    try {
        const { model, prompt, imageUrl } = await req.json();
        const newPrompt = [Constants.PROMPT_OLD, prompt];
        const selectedModel = Constants.AiModelList.find(aiModel => aiModel.value === model);
        const modelName = selectedModel ? selectedModel.modelName : "google/gemini-2.0-pro-exp-02-05:free";

        const apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_AI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: modelName,
                stream: true,
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: newPrompt },
                            { type: "image_url", image_url: { url: imageUrl } }
                        ],
                    },
                ],
            }),
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error(`OpenRouter API error: ${apiResponse.status}`, errorText);
            return NextResponse.json(
                { error: `OpenRouter API request failed with status ${apiResponse.status}` },
                { status: apiResponse.status }
            );
        }

        // Forward the streaming response to the client.
        return new NextResponse(apiResponse.body, {
            headers: { "Content-Type": "text/event-stream" },
        });

    } catch (error: any) {
        console.error("Error in API route:", error);
        return NextResponse.json(
            { error: "Failed to generate code", details: error.message },
            { status: 500 }
        );
    }
}
