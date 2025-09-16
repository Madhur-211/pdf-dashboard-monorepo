import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import PDFParser from "pdf2json";

async function parseWithPdf2Json(fileBuffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser();

    parser.on("pdfParser_dataError", (errData: any) => {
      // Type narrowing: pdf2json emits object with parserError
      if (errData && errData.parserError) {
        reject(errData.parserError);
      } else {
        reject(errData);
      }
    });

    parser.on("pdfParser_dataReady", () => {
      resolve(parser.getRawTextContent());
    });

    parser.parseBuffer(fileBuffer);
  });
}

/**
 * Extract invoice data from PDF text using Gemini or Groq.
 */
export async function extractInvoiceData(
  fileBuffer: Buffer,
  model: "gemini" | "groq"
) {
  let text = "";
  try {
    const pdfParse = await import("pdf-parse");
    const parsed = await pdfParse.default(fileBuffer);
    text = parsed.text || "";
  } catch (err) {
    console.warn("pdf-parse failed, trying pdf2json", (err as Error).message);
    text = await parseWithPdf2Json(fileBuffer);
  }

  // Define the expected schema
  const schema = `
You are an invoice JSON extractor. Extract fields and return ONLY valid JSON matching this schema:

{
  "vendor": { "name": string, "address": string|null, "taxId": string|null },
  "invoice": { "number": string, "date": "YYYY-MM-DD", "currency": string|null, "subtotal": number|null, "taxPercent": number|null, "total": number|null, "poNumber": string|null, "poDate": "YYYY-MM-DD"|null, "lineItems": [{ "description": string, "unitPrice": number, "quantity": number, "total": number }] }
}

Return exactly valid JSON (no markdown, no commentary). If field not found, use null or empty array.

`;

  if (model === "gemini") {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await geminiModel.generateContent([schema, text]);
    const response = result.response.text();

    return safeJSON(response);
  }

  if (model === "groq") {
    const client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY!,
      baseURL: "https://api.groq.com/openai/v1", // Groq API
    });

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant", // Groq recommended replacement
      messages: [
        { role: "system", content: schema },
        { role: "user", content: text },
      ],
    });

    return safeJSON(response.choices[0]?.message?.content || "{}");
  }

  throw new Error("Unsupported model");
}

/**
 * Utility to safely parse AI output into JSON.
 */
function safeJSON(str: string) {
  try {
    const cleaned = str.trim().replace(/^```json|```$/g, "");
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ Failed to parse AI JSON", str);
    return null;
  }
}
