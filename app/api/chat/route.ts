import {
  GoogleGenerativeAI,
  type GenerativeModel,
} from "@google/generative-ai";
import { Readable } from "stream";
require("dotenv").config();

export const runtime = "nodejs";

// Initialize the Gemini AI client with error handling
let genAI: GoogleGenerativeAI;
let model: GenerativeModel;

try {
  console.log(process.env.GOOGLE_GEMINI_API_KEY);
  genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
} catch (error) {
  console.error("Error initializing Gemini AI client:", error);
}

// Helper function to convert Gemini stream to ReadableStream
function geminiStreamToReadable(
  stream: AsyncGenerator<any, any, unknown>
): ReadableStream {
  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of stream) {
          if (chunk.candidates && chunk.candidates[0]?.content) {
            const text = chunk.candidates[0].content;
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      } catch (error) {
        console.error("Error in Gemini stream:", error);
        controller.error(error);
      }
    },
  });
}

export async function POST(req: Request) {
  try {
    // Check if Gemini client is initialized
    if (!genAI || !model) {
      console.error("Gemini AI client not initialized. Check your API key.");
      return new Response(
        "Gemini AI client not initialized. Check your API key.",
        { status: 500 }
      );
    }

    // Parse request with error handling
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error("Error parsing request:", parseError);
      return new Response("Invalid request format", { status: 400 });
    }

    const { messages, mode, documentContent } = requestData;
    console.log("Data received", messages, mode, documentContent);

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response("Invalid messages array", { status: 400 });
    }

    // Get the last user message
    const lastUserMessage = messages.filter((m) => m.role === "user").pop();
    console.log("Latest Message:", lastUserMessage);
    if (!lastUserMessage) {
      return new Response("No user message found", { status: 400 });
    }

    // Create a system prompt based on the selected mode
    let systemPrompt =
      "You are a helpful homework assistant that guides students without giving direct answers. ";

    switch (mode) {
      case "hint":
        systemPrompt +=
          "Provide small, subtle hints that point students in the right direction.";
        break;
      case "concept":
        systemPrompt +=
          "Explain the underlying concepts but do not provide direct solutions.";
        break;
      case "resource":
        systemPrompt +=
          "Suggest relevant learning resources and explain why they are useful.";
        break;
      case "socratic":
        systemPrompt += "Use the Socratic method by asking guiding questions.";
        break;
      default:
        systemPrompt +=
          "Help students learn without solving their homework for them.";
    }

    // Add document context if available
    let fullPrompt = systemPrompt;
    if (documentContent) {
      const limitedContent =
        typeof documentContent === "string"
          ? documentContent.slice(0, 2000) +
            (documentContent.length > 2000 ? "..." : "")
          : "Invalid document content";

      fullPrompt += `\n\nThe student uploaded a document with the following content:\n\n${limitedContent}`;
    }

    fullPrompt += `\n\nStudent's question: ${lastUserMessage.content}`;

    try {
      const chat = model.startChat({
        history: [],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      });

      const result = await chat.sendMessageStream(fullPrompt);

      console.log("Streaming response started...");

      return new Response(
        new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();
            try {
              let response = "";
              for await (const chunk of result.stream) {
                if (chunk.candidates && chunk.candidates[0]?.content) {
                  const text = chunk.candidates[0].content;
                  controller.enqueue(encoder.encode(text.parts[0].text));

                  response = response + text.parts[0].text;
                }
              }
              //console.log("Streamed chunk:", response);
            } catch (error) {
              console.error("Error in streaming:", error);
              controller.enqueue(encoder.encode("Error streaming response."));
            } finally {
              controller.close();
            }
          },
        }),
        { headers: { "Content-Type": "text/plain" } }
      );
    } catch (aiError) {
      console.error("Gemini AI error:", aiError);
      return new Response(
        new ReadableStream({
          start(controller) {
            const message =
              "I'm having trouble connecting to my knowledge base right now. Please try asking your question again in a simpler way, or try again later.";
            controller.enqueue(new TextEncoder().encode(message));
            controller.close();
          },
        }),
        { headers: { "Content-Type": "text/plain" } }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({
        error:
          "I'm having trouble connecting to my knowledge base. Please try again later.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
