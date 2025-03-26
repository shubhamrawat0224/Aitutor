import { type NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

interface Video {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
}

// Initialize the Gemini AI client with error handling
let genAI: GoogleGenerativeAI;
try {
  genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");
} catch (error) {
  console.error("Error initializing Gemini AI client:", error);
  // We'll handle this in the route handler
}

// This is a mock function since we don't have actual YouTube API access
// In a real implementation, you would use the YouTube Data API
async function searchYouTubeVideos(query: string): Promise<Video[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Generate mock data based on the query
  const mockVideos: Video[] = [];

  // Use the query to generate relevant mock data
  const topics = query.split(" ");

  for (let i = 0; i < 3; i++) {
    const topic = topics[i % topics.length];
    mockVideos.push({
      id: `video-${topic}-${i}`.replace(/\s+/g, "-").toLowerCase(),
      title: `Learn about ${topic} - Educational Tutorial Part ${i + 1}`,
      channelTitle: `${topic} Academy`,
      thumbnail: `/placeholder.svg?height=90&width=160&text=${encodeURIComponent(
        topic
      )}`,
    });
  }

  return mockVideos;
}

export async function POST(request: NextRequest) {
  try {
    // Check if Gemini client is initialized
    if (!genAI) {
      console.error("Gemini AI client not initialized. Check your API key.");
      // Return mock data instead of failing
      return NextResponse.json({
        success: true,
        videos: await searchYouTubeVideos("educational content"),
      });
    }

    const { topics } = await request.json();

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json(
        { error: "No topics provided" },
        { status: 400 }
      );
    }

    // Use Gemini to generate better search queries based on the topics
    //console.log("topics:", topics);
    const prompt = `
      I have a document about the following topics: ${topics.join(", ")}.
      Generate 3 specific, educational YouTube  video names that would help a student learn these topics.
      Each query should be focused on educational content and be specific enough to return good results.
      Format your response as a JSON array of strings, with each string being a search query.
      
      Return ONLY a JSON array like ["Query 1", "Query 2", "Query 3"] without any additional text or explanation.
    `;

    try {
      // Get the Gemini model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      // Generate content
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      console.log(
        "responses",
        result.response.candidates[0].content.parts[0].text
      );

      // Parse the response to get search queries
      let searchQueries: string[] = [];
      try {
        // Try to extract JSON array from the response
        const jsonMatch = responseText.match(/\[.*\]/s);
        const jsonString = jsonMatch ? jsonMatch[0] : responseText;

        const cleanedText = jsonString.trim().replace(/```json|```/g, "");
        //console.log("urls", cleanedText);
        searchQueries = JSON.parse(cleanedText);

        // Ensure we have an array of strings
        if (!Array.isArray(searchQueries)) {
          searchQueries = [topics[0] + " tutorial"];
        }
      } catch (error) {
        console.error("Error parsing search queries:", error);
        searchQueries = [topics[0] + " tutorial"];
      }

      // Get video recommendations for each search query
      const allVideos: Video[] = [];

      for (const query of searchQueries) {
        const videos = await searchYouTubeVideos(query);
        // console.log(videos);
        allVideos.push(...videos);
      }
      // console.log(allVideos);
      // Remove duplicates and limit to 6 videos
      const uniqueVideos = allVideos
        .filter(
          (video, index, self) =>
            index === self.findIndex((v) => v.id === video.id)
        )
        .slice(0, 6);
      console.log("Unique videos", uniqueVideos);
      return NextResponse.json({
        success: true,
        videos: uniqueVideos,
      });
    } catch (aiError) {
      console.error("AI processing error:", aiError);
      // Return mock data instead of failing
      return NextResponse.json({
        success: true,
        videos: await searchYouTubeVideos(topics[0]),
      });
    }
  } catch (error) {
    console.error("Error getting video recommendations:", error);
    return NextResponse.json(
      { error: "Failed to get video recommendations" },
      { status: 500 }
    );
  }
}
