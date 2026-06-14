import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Firebase Admin (Only if creds are available, otherwise use mock/graceful fail)
// In AI Studio, we often don't have direct service account access in the same way.
// However, we can use the environment's capabilities.
// For now, I will implement the Gemini API proxy.

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json());

// API Routes
app.post("/api/chatu/generate", async (req, res) => {
  const { prompt, type, userId } = req.body;
  
  if (!prompt || !userId) {
    return res.status(400).json({ error: "Missing prompt or userId" });
  }

  try {
    // Logic: In a real app, deduct 10 Chatus here using admin SDK
    // For this build, we'll respond with the generated result
    const model = "gemini-3.5-flash";
    const systemInstruction = `Ets la ChatuAI, l'Arquitecte i Creador Digital de ChatuWorld. 
    L'usuari ha pagat 100 Chatus per desenvolupar un projecte de tipus ${type} amb la idea: "${prompt}". 
    
    La teva missió és "desenvolupar" aquest projecte proporcionant:
    1. El CODI COMPLET en un ÚNIC FITXER HTML (incloent <style> i <script>) que sigui totalment funcional i autònom.
    2. El codi ha de començar amb <!DOCTYPE html> i ser una experiència interactiva completa.
    3. No incloguis explicacions llargues fora del codi, tot ha d'estar dins del projecte visual.
    4. El missatge de confirmació: "Projecte desplegat satisfactòriament a la Xarxa Chatu".
    
    IMPORTANT: Genera un fitxer .html pur i funcional. L'usuari el veurà directament en un reproductor interactiu.
    Respon amb un to de creador tecnològic expert i entusiasta. 
    Llengua de resposta: Català.`;

    const result = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
      }
    });

    res.json({ result: result.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/chatu/ask", async (req, res) => {
  const { question, userId } = req.body;
  
  try {
    const model = "gemini-3.5-flash";
    const result = await ai.models.generateContent({
      model,
      contents: question,
      config: {
        systemInstruction: "You are ChatuAI. Help the user with ChatuWorld questions.",
      }
    });
    res.json({ result: result.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware for development
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupServer();
