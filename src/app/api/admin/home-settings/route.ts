import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src/data/homeSettings.json");

// Helper to read home settings safely
function readSettings() {
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(fileContent);
    }
  } catch (error) {
    console.error("Error reading home settings file:", error);
  }
  return {
    heroHeadline: "Cakes made as fine art.",
    heroSubtitle: "Welcome to Sweet Delights, where pastry creation is elevated to modern design. Explore our collection of bespoke, organic confections built for milestones.",
    heroCta1Label: "Order Now",
    heroCta2Label: "Explore Collection",
    heroImageUrl: "https://images.unsplash.com/photo-1535141192574-5d4897c13636?q=80&w=1200&auto=format&fit=crop"
  };
}

// GET /api/admin/home-settings - Get current homepage customization
export async function GET(req: NextRequest) {
  try {
    const settings = readSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: "Failed to read settings" }, { status: 500 });
  }
}

// PUT /api/admin/home-settings - Update homepage customization
export async function PUT(req: NextRequest) {
  try {
    // Authenticate Admin
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { heroHeadline, heroSubtitle, heroCta1Label, heroCta2Label, heroImageUrl } = body;

    const newSettings = {
      heroHeadline: heroHeadline || "Cakes made as fine art.",
      heroSubtitle: heroSubtitle || "",
      heroCta1Label: heroCta1Label || "Order Now",
      heroCta2Label: heroCta2Label || "Explore Collection",
      heroImageUrl: heroImageUrl || "https://images.unsplash.com/photo-1535141192574-5d4897c13636?q=80&w=1200&auto=format&fit=crop"
    };

    // Ensure data directory exists
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Write file
    fs.writeFileSync(filePath, JSON.stringify(newSettings, null, 2), "utf-8");

    return NextResponse.json({
      message: "Home settings updated successfully",
      settings: newSettings
    });
  } catch (error) {
    console.error("Update home settings error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
