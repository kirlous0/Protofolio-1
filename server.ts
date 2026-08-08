import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { initialPersonalInfo, initialProjects } from "./src/data/initialData";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // Persistence directory and file paths
  const DATA_DIR = path.join(process.cwd(), "data");
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");
  const PERSONAL_INFO_FILE = path.join(DATA_DIR, "personalInfo.json");
  const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");
  const INTEGRATIONS_FILE = path.join(DATA_DIR, "integrations.json");

  function readJsonFile<T>(filePath: string, fallback: T): T {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(content) as T;
      }
    } catch (err) {
      console.error(`Error reading ${filePath}:`, err);
    }
    return fallback;
  }

  function writeJsonFile<T>(filePath: string, data: T): void {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error(`Error writing ${filePath}:`, err);
    }
  }

  // Initialize data files if not present
  if (!fs.existsSync(PROJECTS_FILE)) {
    writeJsonFile(PROJECTS_FILE, initialProjects);
  }
  if (!fs.existsSync(PERSONAL_INFO_FILE)) {
    writeJsonFile(PERSONAL_INFO_FILE, initialPersonalInfo);
  }
  if (!fs.existsSync(MESSAGES_FILE)) {
    writeJsonFile(MESSAGES_FILE, []);
  }

  // Initialize Gemini AI Client
  const getGenAIClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
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

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Projects CRUD Server Endpoints
  app.get("/api/projects", (req, res) => {
    const projects = readJsonFile(PROJECTS_FILE, initialProjects);
    res.json({ success: true, projects });
  });

  app.post("/api/projects", (req, res) => {
    try {
      const { projects } = req.body;
      if (Array.isArray(projects)) {
        writeJsonFile(PROJECTS_FILE, projects);
        return res.json({ success: true, projects });
      }
      res.status(400).json({ success: false, error: "Invalid projects array." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || "Failed to save projects." });
    }
  });

  app.post("/api/projects/reset", (req, res) => {
    writeJsonFile(PROJECTS_FILE, initialProjects);
    res.json({ success: true, projects: initialProjects });
  });

  // Personal Info Server Endpoints
  app.get("/api/personal-info", (req, res) => {
    const info = readJsonFile(PERSONAL_INFO_FILE, initialPersonalInfo);
    res.json({ success: true, personalInfo: info });
  });

  app.post("/api/personal-info", (req, res) => {
    try {
      const { info } = req.body;
      if (info && typeof info === "object") {
        writeJsonFile(PERSONAL_INFO_FILE, info);
        return res.json({ success: true, personalInfo: info });
      }
      res.status(400).json({ success: false, error: "Invalid info object." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || "Failed to save info." });
    }
  });

  // Contact Messages Server Endpoints
  app.get("/api/messages", (req, res) => {
    const messages = readJsonFile(MESSAGES_FILE, []);
    res.json({ success: true, messages });
  });

  app.post("/api/messages", (req, res) => {
    try {
      const { messages } = req.body;
      if (Array.isArray(messages)) {
        writeJsonFile(MESSAGES_FILE, messages);
        return res.json({ success: true, messages });
      }
      res.status(400).json({ success: false, error: "Invalid messages array." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || "Failed to save messages." });
    }
  });

  // Integrations Config Server Endpoints
  app.get("/api/integrations", (req, res) => {
    const config = readJsonFile(INTEGRATIONS_FILE, {});
    res.json({ success: true, config });
  });

  app.post("/api/integrations", (req, res) => {
    try {
      const { config } = req.body;
      writeJsonFile(INTEGRATIONS_FILE, config || {});
      res.json({ success: true, config: config || {} });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || "Failed to save integrations." });
    }
  });

  // Smart AI Assistant for Project Metadata
  app.post("/api/ai/enhance-project", async (req, res) => {
    try {
      const { title, description, techStack, category, readmeContent, githubUrl, liveUrl } = req.body;

      const ai = getGenAIClient();

      const promptText = `You are a principal software architect and technical lead creating a high-impact portfolio showcase entry for Kirlous Wael (Full Stack Web Developer & Android Developer).

Your goal is to perform a deep, comprehensive technical analysis of this project and generate rich, unique, and deeply descriptive portfolio metadata.

CRITICAL DIRECTIVES:
1. STRICT UNIQUNESS: Avoid generic boilerplate sentences like "Modern application built with cutting edge technologies". Every sentence MUST be uniquely customized to the specific functional domain, name, tech stack, and README of THIS project.
2. WHAT IS THE PROJECT: Vividly describe what this software actually is, what domain it serves (e.g. e-commerce platform, real-time analytics dashboard, Android utility, AI companion, social network), its target users, and core value proposition.
3. KEY FEATURES & CAPABILITIES: Detail 4 to 6 specific, tangible user capabilities and architectural features.
4. TECHNOLOGIES & ARCHITECTURE: List the actual tech stack and explain clearly why each technology was chosen and its technical responsibility in the system.
5. TECHNICAL CASE STUDY: Write an exhaustive Markdown case study covering the Problem, Architectural Approach, Key Features, Tech Stack Rationale, and High-Impact Engineering Achievements.

Project Input Data:
- Project Name: ${title || "Untitled Project"}
- Existing Description: ${description || "None provided"}
- Category: ${category || "Web"}
- Tech Stack Input: ${Array.isArray(techStack) ? techStack.join(", ") : techStack || "None"}
- GitHub Repository: ${githubUrl || "N/A"}
- Production Live URL: ${liveUrl || "N/A"}
${readmeContent ? `- Repository README Content:\n"""\n${readmeContent.slice(0, 5000)}\n"""` : ""}

Return a structured JSON object:
1. "autoTitle": An evocative, professional marketing & engineering title (e.g., "Nile Store - E-Commerce Web Engine & Real-Time Merchant Portal").
2. "problem": A deep 2-3 sentence description of the technical or business challenge solved.
3. "solution": A deep 2-3 sentence description of the architectural design and state management strategy implemented.
4. "keyFeatures": Array of 4 to 6 detailed, highly specific feature descriptions.
5. "enhancedDescription": A vivid 3-sentence executive summary explaining what the project is, its purpose, and core tech stack.
6. "longDescription": A comprehensive technical case study in clean Markdown format structured with:
   - ## 🚀 What is ${title || "this project"}?
   - ## 💡 The Engineering Challenge & Solution
   - ## ✨ Core Features & Key Capabilities
   - ## 🛠️ Technology Stack & Architectural Rationale
   - ## 🏆 High-Impact Engineering Highlights
7. "techStack": Array of core technologies used, ordered by importance.
8. "highlights": Array of 4-5 impressive technical achievement bullet points (e.g. "Achieved sub-100ms API response latency using optimistic data caching").
9. "seoMetadata": Full search engine optimization object (metaTitle, metaDescription, ogTitle, ogDescription, ogType, keywords).`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              autoTitle: { type: Type.STRING },
              problem: { type: Type.STRING },
              solution: { type: Type.STRING },
              keyFeatures: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              enhancedDescription: { type: Type.STRING },
              longDescription: { type: Type.STRING },
              techStack: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              highlights: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              seoMetadata: {
                type: Type.OBJECT,
                properties: {
                  metaTitle: { type: Type.STRING },
                  metaDescription: { type: Type.STRING },
                  ogTitle: { type: Type.STRING },
                  ogDescription: { type: Type.STRING },
                  ogType: { type: Type.STRING },
                  keywords: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ["metaTitle", "metaDescription", "ogTitle", "ogDescription", "ogType", "keywords"],
              },
            },
            required: [
              "autoTitle",
              "problem",
              "solution",
              "keyFeatures",
              "enhancedDescription",
              "longDescription",
              "techStack",
              "highlights",
              "seoMetadata",
            ],
          },
        },
      });

      const rawJson = response.text || "{}";
      const parsedData = JSON.parse(rawJson);
      res.json({ success: true, data: parsedData });
    } catch (error: any) {
      console.error("Gemini AI Enhancement Error:", error);
      res.status(500).json({
        success: false,
        error: error?.message || "Failed to generate AI metadata.",
      });
    }
  });

  // GitHub Proxy: Fetch Authenticated User Profile & Health
  app.post("/api/integrations/github/user", async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ success: false, error: "GitHub token is required." });
      }

      const ghRes = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "KirlousPortfolioApp",
        },
      });

      if (!ghRes.ok) {
        const errText = await ghRes.text();
        return res.status(ghRes.status).json({
          success: false,
          error: `GitHub API error (${ghRes.status}): ${errText || ghRes.statusText}`,
        });
      }

      const user = await ghRes.json();
      res.json({ success: true, user });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || "Failed to fetch GitHub user profile." });
    }
  });

  // GitHub Proxy: Fetch Repositories
  app.post("/api/integrations/github/repos", async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ success: false, error: "GitHub token is required." });
      }

      const ghRes = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated&type=all", {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "KirlousPortfolioApp",
        },
      });

      if (!ghRes.ok) {
        const errText = await ghRes.text();
        return res.status(ghRes.status).json({
          success: false,
          error: `GitHub API error (${ghRes.status}): ${errText || ghRes.statusText}`,
        });
      }

      const repos = await ghRes.json();
      res.json({ success: true, repos });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || "Failed to fetch GitHub repos." });
    }
  });

  // GitHub Proxy: Fetch README
  app.post("/api/integrations/github/readme", async (req, res) => {
    try {
      const { owner, repo, token, githubUrl } = req.body;
      let targetOwner = owner;
      let targetRepo = repo;

      if (githubUrl && (!owner || !repo)) {
        const cleaned = githubUrl.replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, "");
        const parts = cleaned.split("/");
        if (parts.length >= 2) {
          targetOwner = parts[0];
          targetRepo = parts[1];
        }
      }

      if (!targetOwner || !targetRepo) {
        return res.status(400).json({ success: false, error: "Invalid repository parameters." });
      }

      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3.raw",
        "User-Agent": "KirlousPortfolioApp",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token.trim()}`;
      }

      const readmeRes = await fetch(`https://api.github.com/repos/${targetOwner}/${targetRepo}/readme`, {
        headers,
      });

      if (!readmeRes.ok) {
        return res.status(404).json({ success: false, error: "README not found or inaccessible." });
      }

      const content = await readmeRes.text();
      res.json({ success: true, content, owner: targetOwner, repo: targetRepo });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || "Failed to fetch README." });
    }
  });

  // Vercel Proxy: Fetch User Profile
  app.post("/api/integrations/vercel/user", async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ success: false, error: "Vercel API Token is required." });
      }

      const cleanToken = token.trim().replace(/^Bearer\s+/i, "");

      const vRes = await fetch("https://api.vercel.com/v2/user", {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          "User-Agent": "KirlousPortfolioApp",
        },
      });

      const data = await vRes.json();

      if (!vRes.ok) {
        return res.status(vRes.status).json({
          success: false,
          error: data.error?.message || data.message || `Vercel Auth error (${vRes.status}). Check token credentials.`,
        });
      }

      res.json({ success: true, user: data.user || data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || "Failed to fetch Vercel user profile." });
    }
  });

  // Vercel Proxy: Fetch Projects with automatic teamId fallback
  app.post("/api/integrations/vercel/projects", async (req, res) => {
    try {
      const { token, teamId } = req.body;
      if (!token) {
        return res.status(400).json({ success: false, error: "Vercel API Token is required." });
      }

      const cleanToken = token.trim().replace(/^Bearer\s+/i, "");
      const cleanTeamId = teamId && typeof teamId === "string" ? teamId.trim() : "";

      let url = "https://api.vercel.com/v9/projects";
      if (cleanTeamId && cleanTeamId !== "undefined" && cleanTeamId !== "null") {
        url += `?teamId=${encodeURIComponent(cleanTeamId)}`;
      }

      let vRes = await fetch(url, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          "User-Agent": "KirlousPortfolioApp",
        },
      });

      // Automatic fallback: If request with teamId failed with 400/401/403/404, retry WITHOUT teamId!
      if (!vRes.ok && cleanTeamId) {
        console.log(`Vercel project request with teamId '${cleanTeamId}' returned ${vRes.status}, retrying without teamId...`);
        vRes = await fetch("https://api.vercel.com/v9/projects", {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            "User-Agent": "KirlousPortfolioApp",
          },
        });
      }

      const data = await vRes.json();

      if (!vRes.ok) {
        return res.status(vRes.status).json({
          success: false,
          error: data.error?.message || data.message || `Vercel API error (${vRes.status}). Check token credentials.`,
        });
      }

      res.json({ success: true, projects: data.projects || [] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || "Failed to fetch Vercel projects." });
    }
  });

  // Vercel Proxy: Fetch Deployments for a Project
  app.post("/api/integrations/vercel/deployments", async (req, res) => {
    try {
      const { token, projectId, teamId } = req.body;
      if (!token) {
        return res.status(400).json({ success: false, error: "Vercel API Token is required." });
      }

      const cleanToken = token.trim().replace(/^Bearer\s+/i, "");
      const cleanTeamId = teamId && typeof teamId === "string" ? teamId.trim() : "";
      const cleanProjectId = projectId && typeof projectId === "string" ? projectId.trim() : "";

      let url = `https://api.vercel.com/v6/deployments?limit=10`;
      if (cleanProjectId) {
        url += `&projectId=${encodeURIComponent(cleanProjectId)}`;
      }
      if (cleanTeamId && cleanTeamId !== "undefined" && cleanTeamId !== "null") {
        url += `&teamId=${encodeURIComponent(cleanTeamId)}`;
      }

      let vRes = await fetch(url, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          "User-Agent": "KirlousPortfolioApp",
        },
      });

      // Fallback: If failed with teamId, retry without teamId
      if (!vRes.ok && cleanTeamId) {
        let fallbackUrl = `https://api.vercel.com/v6/deployments?limit=10`;
        if (cleanProjectId) {
          fallbackUrl += `&projectId=${encodeURIComponent(cleanProjectId)}`;
        }
        vRes = await fetch(fallbackUrl, {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            "User-Agent": "KirlousPortfolioApp",
          },
        });
      }

      const data = await vRes.json();

      if (!vRes.ok) {
        return res.status(vRes.status).json({
          success: false,
          error: data.error?.message || data.message || `Vercel Deployments error (${vRes.status}).`,
        });
      }

      res.json({ success: true, deployments: data.deployments || [] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || "Failed to fetch Vercel deployments." });
    }
  });

  // Vite development middleware vs Static Production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
