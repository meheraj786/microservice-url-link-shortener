import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { nanoid } from "nanoid";
import redis from "../lib/redis.js";
import { authenticateToken, type AuthenticatedRequest } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/shorten", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { originalUrl } = req.body;
    const userId = req.user?.userId || null; 

    if (!originalUrl) {
      return res.status(400).json({ error: "originalUrl is required" });
    }

    const shortCode = nanoid(7);

    const url = await prisma.url.create({
      data: {
        shortCode,
        originalUrl,
        userId,
      },
    });

    await redis.set(shortCode, originalUrl, "EX", 86400);

    res.status(201).json({
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      userId: url.userId,
      shortUrl: `http://localhost:3000/${url.shortCode}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/my-urls", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. Token is required to view your URLs." });
    }

    const urls = await prisma.url.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(urls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;

    const cachedUrl = await redis.get(shortCode);

    if (cachedUrl) {
      prisma.url
        .update({
          where: { shortCode },
          data: { clicks: { increment: 1 } },
        })
        .catch(console.error);

      return res.redirect(cachedUrl);
    }

    const url = await prisma.url.findUnique({
      where: { shortCode },
    });

    if (!url) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    await redis.set(shortCode, url.originalUrl, "EX", 86400);

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