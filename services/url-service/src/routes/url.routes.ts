import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { nanoid } from "nanoid";
import redis from "../lib/redis.js";

const router = Router();

// Create Short URL
router.post("/shorten", async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: "originalUrl is required" });
    }

    const shortCode = nanoid(7);

    const url = await prisma.url.create({
      data: {
        shortCode,
        originalUrl,
      },
    });

    // Cache e save koro (1 day = 86400 seconds)
    await redis.set(shortCode, originalUrl, "EX", 86400);

    res.status(201).json({
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      shortUrl: `http://localhost:3000/${url.shortCode}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Redirect (with Cache)
router.get("/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;

    // 1. Age Redis e khujbo
    const cachedUrl = await redis.get(shortCode);

    if (cachedUrl) {
      // Click count background e update
      prisma.url
        .update({
          where: { shortCode },
          data: { clicks: { increment: 1 } },
        })
        .catch(console.error);

      return res.redirect(cachedUrl);
    }

    // 2. Redis e na thakle Database e jabo
    const url = await prisma.url.findUnique({
      where: { shortCode },
    });

    if (!url) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    // 3. Database theke peyele Redis e save korbo
    await redis.set(shortCode, url.originalUrl, "EX", 86400);

    // Click count update
    await prisma.url.update({
      where: { shortCode },
      data: { clicks: { increment: 1 } },
    });

    res.redirect(url.originalUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;