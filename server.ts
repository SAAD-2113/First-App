import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI client lazily or if key exists
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API endpoint for generating flashcard decks from a topic
app.post("/api/ai/generate-flashcards", async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic || typeof topic !== "string" || !topic.trim()) {
      res.status(400).json({ error: "A valid topic is required." });
      return;
    }

    const ai = getAIClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Create an educational flashcard deck covering the topic: "${topic.trim()}". Make it engaging and perfect for quick study.`,
      config: {
        systemInstruction: "You are an expert educator who designs high-quality, clear, and effective flashcards. Select the best matching icon and color from the specified lists to match the mood of the topic.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "Short and descriptive title for the flashcard deck (e.g. 'Mitochondria Basics')",
            },
            description: {
              type: Type.STRING,
              description: "Brief summary of what this deck covers (under 100 characters)",
            },
            iconName: {
              type: Type.STRING,
              description: "The most appropriate icon name. MUST select exactly one from this allowed list: 'BookOpen', 'Smartphone', 'Globe', 'Orbit', 'GraduationCap', 'Heart', 'Cpu'",
            },
            color: {
              type: Type.STRING,
              description: "The most appropriate tailwind gradient. MUST select exactly one from this allowed list: 'from-blue-500 to-cyan-500', 'from-indigo-500 to-purple-500', 'from-fuchsia-500 to-pink-500', 'from-amber-500 to-rose-500', 'from-emerald-500 to-teal-500', 'from-slate-700 to-slate-900'",
            },
            cards: {
              type: Type.ARRAY,
              description: "Array of exactly 5 to 7 high-quality study cards",
              items: {
                type: Type.OBJECT,
                properties: {
                  question: {
                    type: Type.STRING,
                    description: "A clear, focused, and challenging card question (under 180 characters)",
                  },
                  answer: {
                    type: Type.STRING,
                    description: "The correct, precise, and concise explanation (under 280 characters)",
                  },
                },
                required: ["question", "answer"],
              },
            },
          },
          required: ["title", "description", "iconName", "color", "cards"],
        },
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("No text content returned from the Gemini API.");
    }

    const deckData = JSON.parse(textOutput);
    res.json(deckData);
  } catch (error: any) {
    console.error("Error generating flashcards with AI:", error);
    res.status(500).json({
      error: error.message || "Failed to generate flashcards using AI.",
    });
  }
});

// Serve the logo image cleanly for the PWA manifest
app.get("/logo.jpg", (req, res) => {
  res.sendFile(path.join(process.cwd(), "src/assets/images/flash_logo_1782807814143.jpg"));
});

// Vite middleware for development or static serving for production
async function setupApp() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupApp();
