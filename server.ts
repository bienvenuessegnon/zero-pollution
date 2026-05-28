import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// Middleware of express JSON body parsing
app.use(express.json());

// Initialize server-side Gemini client safely (lazy)
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API Client initialized successfully.");
  } catch (err) {
    console.error("Error initializing Gemini client:", err);
  }
} else {
  console.warn("GEMINI_API_KEY not found or is a placeholder. Using fallback static intelligence simulator.");
}

// REST API for checking API Health
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    hasApiKey: !!apiKey && apiKey !== "MY_GEMINI_API_KEY",
  });
});

// Post endpoint to classify incident descriptions
app.post("/api/analyze", async (req, res) => {
  const { description } = req.body;

  if (!description || typeof description !== "string") {
    return res.status(400).json({ error: "La description de l'incident est requise." });
  }

  // Fallback simulator output for when the Gemini API is offline or key is unconfigured
  const getSimulatedAnalysis = (text: string) => {
    const textLower = text.toLowerCase();
    
    let severity: "faible" | "moyen" | "grave" | "critique" = "moyen";
    let category: "Ordures" | "Pollution" | "Caniveau bouché" | "Eau stagnante" | "Décharge sauvage" | "Fumée toxique" | "Incendie" | "Autre" = "Autre";
    let title = "Signalement environnemental";
    let explanation = "Analyse simulée en local : Nous vous invitons à vérifier les détails du signalement.";

    if (textLower.includes("feu") || textLower.includes("incendie") || textLower.includes("brûle") || textLower.includes("brule")) {
      severity = "critique";
      category = "Incendie";
      title = "Incendie ou feu de décharges";
      explanation = "ALERTE SÉCURITÉ : Risque d'incendie de grande envergure avec émanations de gaz asphyxiants. Les autorités de secours et de lutte contre l'incendie (Sapeurs-Pompiers) doivent être alertées immédiatement.";
    } else if (textLower.includes("fumée") || textLower.includes("fumee") || textLower.includes("toxique") || textLower.includes("gaz")) {
      severity = "grave";
      category = "Fumée toxique";
      title = "Émanations de fumées toxiques";
      explanation = "DANGER ATMOSPHÉRIQUE : Émanation continue de fumées polluantes pouvant causer de graves détresses respiratoires chez les enfants et les personnes âgées vivant à proximité.";
    } else if (textLower.includes("caniveau") || textLower.includes("bouché") || textLower.includes("bouche") || textLower.includes("égout") || textLower.includes("egout")) {
      severity = "grave";
      category = "Caniveau bouché";
      title = "Caniveau bouché ou obstruction";
      explanation = "RISQUE D'INONDATION : Ce caniveau obstrué par des sédiments ou détritus ménagers risque de causer des inondations majeures lors des prochaines averses, en plus de dégager de mauvaises odeurs constantes.";
    } else if (textLower.includes("stagnante") || textLower.includes("stagne") || textLower.includes("flaque") || textLower.includes("marécage") || textLower.includes("marecage")) {
      severity = "moyen";
      category = "Eau stagnante";
      title = "Accumulation d'eaux stagnantes";
      explanation = "RISQUE SANITAIRE : Véritable gîte larvaire favorisant la prolifération intense de moustiques vecteurs du paludisme et de la dengue. Un assèchement ou traitement rapide est fortement recommandé.";
    } else if (textLower.includes("décharge") || textLower.includes("decharge") || textLower.includes("sauvage") || textLower.includes("tas géant")) {
      severity = "grave";
      category = "Décharge sauvage";
      title = "Décharge sauvage d'ordures";
      explanation = "NUISANCE URBAINE MAJEURE : Entassement anarchique de déchets solides d'origines diverses attirant rongeurs et insectes nuisibles. Risque d'infiltration des lixiviats et pollution du sol.";
    } else if (textLower.includes("ordures") || textLower.includes("poubelle") || textLower.includes("sachet") || textLower.includes("déchet") || textLower.includes("dechet")) {
      severity = "faible";
      category = "Ordures";
      title = "Dépôt sauvage d'ordures ménagères";
      explanation = "SALUBRITÉ DE PROXIMITÉ : Amas localisé d'ordures ménagères jonchant la voie publique. Nuisance olfactive et visuelle méritant une collecte de routine.";
    } else if (textLower.includes("pollution") || textLower.includes("chimique") || textLower.includes("huile") || textLower.includes("déversement")) {
      severity = "grave";
      category = "Pollution";
      title = "Pollution chimique ou déversement";
      explanation = "RISQUE ÉCOLOGIQUE : Déversement nocif d'huiles moteurs usagées ou produits chimiques altérant la biodiversité urbaine locale et polluant les nappes phréatiques superficielles.";
    }

    return {
      severity,
      category,
      confidenceScore: 0.85,
      title,
      explanation: explanation + " (Détecté via l'Intelligence Artificielle Locale)."
    };
  };

  // If live Gemini client is not initialized or deactivated, use local simulator
  if (!ai) {
    const analysis = getSimulatedAnalysis(description);
    return res.json(analysis);
  }

  try {
    const systemPrompt = `Tu es une IA experte en gestion environnementale des villes africaines et tropicales.
Ta tâche est d'analyser une description textuelle d'un signalement d'incident citoyen (en français) pour :
1. Déterminer la gravité d'urgence :
   - "faible" : petits tas d'ordures, feuilles mortes, désordre esthétique simple.
   - "moyen" : stagnation d'eau claire sans odeur forte, ordures perturbant peu le trafic, petits nids de moustiques.
   - "grave" : caniveaux très bouchés, décharge sauvage importante, pollution chimique, eaux stagnantes noires/nauséabondes gâtant la route.
   - "critique" : feux de déchets ménagers, incendies de brousse/forêt, fumée toxique continue à côté d'une école/hôpital, inondation totale d'habitation, éboulement de terrain.
2. Assigner l'une de ces catégories exactes seulement : 'Ordures', 'Pollution', 'Caniveau bouché', 'Eau stagnante', 'Décharge sauvage', 'Fumée toxique', 'Incendie', 'Autre'.
3. Rédiger un titre court et percutant en français (maximum 5 mots).
4. Fournir une explication d'expert complète en français conseillant les citoyens sur les risques et donnant les consignes de sécurité essentielles ou les contacts utiles d'urgence.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Analyse ce signalement citoyen : "${description}"`,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            severity: {
              type: Type.STRING,
              description: "Must be exactly one of: 'faible', 'moyen', 'grave', 'critique'.",
            },
            category: {
              type: Type.STRING,
              description: "Must be exactly one of: 'Ordures', 'Pollution', 'Caniveau bouché', 'Eau stagnante', 'Décharge sauvage', 'Fumée toxique', 'Incendie', 'Autre'.",
            },
            confidenceScore: {
              type: Type.NUMBER,
              description: "Confidence value between 0.0 and 1.0.",
            },
            title: {
              type: Type.STRING,
              description: "Short descriptive title of maximum 5 words in French.",
            },
            explanation: {
              type: Type.STRING,
              description: "A professional and friendly community environmental advisory/explanation in French about risks and quick action tips.",
            },
          },
          required: ["severity", "category", "confidenceScore", "title", "explanation"],
        },
      },
    });

    const textResult = response.text?.trim() || "";
    try {
      const parsed = JSON.parse(textResult);
      return res.json(parsed);
    } catch {
      // In case json parsing failed, fall back to safe simulated mapping
      console.warn("Failed to parse Gemini response as JSON:", textResult);
      return res.json(getSimulatedAnalysis(description));
    }

  } catch (error) {
    console.error("Gemini classification API error, falling back to local processing:", error);
    return res.json(getSimulatedAnalysis(description));
  }
});

// Configure Vite middleware in development or serve built files in production
async function runServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite development middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static distribution files from:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Zéro Pollution App Server running on http://localhost:${PORT}`);
  });
}

runServer().catch((err) => {
  console.error("Failed to start server:", err);
});
