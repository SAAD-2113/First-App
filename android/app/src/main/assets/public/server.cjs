var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_genai = require("@google/genai");
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }
  return new import_genai.GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
};
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
          type: import_genai.Type.OBJECT,
          properties: {
            title: {
              type: import_genai.Type.STRING,
              description: "Short and descriptive title for the flashcard deck (e.g. 'Mitochondria Basics')"
            },
            description: {
              type: import_genai.Type.STRING,
              description: "Brief summary of what this deck covers (under 100 characters)"
            },
            iconName: {
              type: import_genai.Type.STRING,
              description: "The most appropriate icon name. MUST select exactly one from this allowed list: 'BookOpen', 'Smartphone', 'Globe', 'Orbit', 'GraduationCap', 'Heart', 'Cpu'"
            },
            color: {
              type: import_genai.Type.STRING,
              description: "The most appropriate tailwind gradient. MUST select exactly one from this allowed list: 'from-blue-500 to-cyan-500', 'from-indigo-500 to-purple-500', 'from-fuchsia-500 to-pink-500', 'from-amber-500 to-rose-500', 'from-emerald-500 to-teal-500', 'from-slate-700 to-slate-900'"
            },
            cards: {
              type: import_genai.Type.ARRAY,
              description: "Array of exactly 5 to 7 high-quality study cards",
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  question: {
                    type: import_genai.Type.STRING,
                    description: "A clear, focused, and challenging card question (under 180 characters)"
                  },
                  answer: {
                    type: import_genai.Type.STRING,
                    description: "The correct, precise, and concise explanation (under 280 characters)"
                  }
                },
                required: ["question", "answer"]
              }
            }
          },
          required: ["title", "description", "iconName", "color", "cards"]
        }
      }
    });
    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("No text content returned from the Gemini API.");
    }
    const deckData = JSON.parse(textOutput);
    res.json(deckData);
  } catch (error) {
    console.error("Error generating flashcards with AI:", error);
    res.status(500).json({
      error: error.message || "Failed to generate flashcards using AI."
    });
  }
});
app.get("/logo.jpg", (req, res) => {
  res.sendFile(import_path.default.join(process.cwd(), "src/assets/images/flash_logo_1782807814143.jpg"));
});
async function setupApp() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
setupApp();
//# sourceMappingURL=server.cjs.map
