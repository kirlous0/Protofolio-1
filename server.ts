import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

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

  // Smart AI Assistant for Project Metadata
  app.post("/api/ai/enhance-project", async (req, res) => {
    try {
      const { title, description, techStack, category, readmeContent, githubUrl, liveUrl } = req.body;

      const ai = getGenAIClient();

      const promptText = `You are an elite principal engineer and technical developer portfolio strategist for Kirlous Wael (Full Stack Web & Android Developer).
Your goal is to deeply analyze the provided codebase/README details and synthesize high-converting, professional, and SEO-optimized portfolio metadata.

Input Information:
- Current Title: ${title || "Untitled Project"}
- Current Short Description: ${description || "None provided"}
- Category: ${category || "Web"}
- Current Tech Stack: ${Array.isArray(techStack) ? techStack.join(", ") : techStack || "None"}
- GitHub Repository URL: ${githubUrl || "N/A"}
- Live Demo / Production URL: ${liveUrl || "N/A"}
${readmeContent ? `- Repository README content snippet:\n"""${readmeContent.slice(0, 4000)}"""` : ""}

Generate a comprehensive JSON object with:
1. "autoTitle": A catchy, compelling, and professional title (e.g. "Nile Elegance - E-Commerce Web Platform & Admin Suite").
2. "problem": An articulate explanation of the engineering problem solved.
3. "solution": A clear explanation of the architecture, state management, and performance strategy.
4. "keyFeatures": 4 to 6 key technical features or capabilities.
5. "enhancedDescription": A crisp 2-sentence summary suitable for portfolio preview cards.
6. "longDescription": A detailed technical case study in clean Markdown format covering Problem, Architecture, Tech Decisions, and Highlights.
7. "techStack": Array of key technologies sorted by importance.
8. "highlights": Array of 3-5 technical accomplishment bullet points.
9. "seoMetadata": Full search engine optimization fields (metaTitle, metaDescription, ogTitle, ogDescription, ogType, keywords).`;

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

  // Vercel Proxy: Fetch Deployments & Projects
  app.post("/api/integrations/vercel/projects", async (req, res) => {
    try {
      const { token, teamId } = req.body;
      if (!token) {
        return res.status(400).json({ success: false, error: "Vercel API Token is required." });
      }

      let url = "https://api.vercel.com/v9/projects";
      if (teamId) {
        url += `?teamId=${encodeURIComponent(teamId.trim())}`;
      }

      const vRes = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
        },
      });

      if (!vRes.ok) {
        const errText = await vRes.text();
        return res.status(vRes.status).json({
          success: false,
          error: `Vercel API error (${vRes.status}): ${errText || vRes.statusText}`,
        });
      }

      const data = await vRes.json();
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

      let url = `https://api.vercel.com/v6/deployments?limit=10`;
      if (projectId) {
        url += `&projectId=${encodeURIComponent(projectId.trim())}`;
      }
      if (teamId) {
        url += `&teamId=${encodeURIComponent(teamId.trim())}`;
      }

      const vRes = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
        },
      });

      if (!vRes.ok) {
        const errText = await vRes.text();
        return res.status(vRes.status).json({
          success: false,
          error: `Vercel Deployments error (${vRes.status}): ${errText || vRes.statusText}`,
        });
      }

      const data = await vRes.json();
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
