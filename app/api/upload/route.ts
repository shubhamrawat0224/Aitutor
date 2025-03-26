import { type NextRequest, NextResponse } from "next/server";
import { Buffer } from "buffer";

export const runtime = "nodejs";

// Function to extract text from PDF (mock implementation)
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // In a real implementation, you would use a library like pdf-parse
    // For this example, we'll use a simplified approach
    const pdfParse = await import("pdf-parse").catch(() => null);
    if (pdfParse) {
      const data = await pdfParse.default(buffer);
      return data.text;
    }
    return "This is simulated PDF content extraction. In a production environment, we would use pdf-parse library.";
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    return "Failed to extract text from PDF. Please try a different file.";
  }
}

// Function to extract text from Word document (mock implementation)
async function extractTextFromWord(buffer: Buffer): Promise<string> {
  try {
    // In a real implementation, you would use a library like mammoth.js
    // For this example, we'll use a simplified approach
    const mammoth = await import("mammoth").catch(() => null);
    if (mammoth) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    return "This is simulated Word document content extraction. In a production environment, we would use mammoth.js library.";
  } catch (error) {
    console.error("Error extracting text from Word document:", error);
    return "Failed to extract text from Word document. Please try a different file.";
  }
}

// Function to extract text from text file
function extractTextFromTxt(buffer: Buffer): string {
  try {
    return buffer.toString("utf-8");
  } catch (error) {
    console.error("Error reading text file:", error);
    return "Failed to read text file. Please try a different file.";
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only PDF, Word, and text files are allowed.",
        },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Get file buffer directly without writing to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text based on file type
    let extractedText = "";

    if (file.type === "application/pdf") {
      extractedText = await extractTextFromPDF(buffer);
    } else if (file.type.includes("word")) {
      extractedText = await extractTextFromWord(buffer);
    } else if (file.type === "text/plain") {
      extractedText = extractTextFromTxt(buffer);
    }

    return NextResponse.json({
      success: true,
      content: extractedText,
    });
  } catch (error) {
    console.error("Error processing file upload:", error);
    return NextResponse.json(
      { error: "Failed to process file upload" },
      { status: 500 }
    );
  }
}

