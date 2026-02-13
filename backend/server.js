import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());
app.use(express.json());

// simple in-memory limit
const usage = new Map();

app.post("/api/generate", async (req, res) => {
  const { prompt, aspectRatio } = req.body;
  const ip = req.ip;
  const today = new Date().toDateString();

  if (!prompt) {
    return res.status(400).json({ error: "Prompt required" });
  }

  const record = usage.get(ip) || { date: today, count: 0 };

  if (record.date !== today) {
    record.date = today;
    record.count = 0;
  }

  if (record.count >= 5) {
    return res.status(429).json({ error: "Daily limit reached" });
  }

  record.count++;
  usage.set(ip, record);

  try {
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: aspectRatio === "9:16" ? "1024x1792" : "1024x1024"
    });

    res.json({
      success: true,
      imageUrl: result.data[0].url,
      remaining: 5 - record.count
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Image generation failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
