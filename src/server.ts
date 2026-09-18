import express from "express";
import cors from "cors";
import path from "path";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";
import { db } from "./db/index";
import { users, votes } from "./db/schema";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from the "public" directory
app.use(express.static(path.join(__dirname, "../public")));

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Sabrina Family API is running" });
});

// LOGIN / REGISTER PIN API
app.post("/api/login", async (req, res) => {
  const { username, pin } = req.body;

  if (!username || !pin) {
    return res.status(400).json({ success: false, message: "Username and PIN are required" });
  }

  try {
    // Cek apakah user sudah ada
    const existingUser = await db.select().from(users).where(eq(users.name, username)).limit(1);

    if (existingUser.length > 0) {
      // User sudah ada, cek PIN
      if (existingUser[0].pin === pin) {
        return res.json({ success: true, message: "Login success", user: existingUser[0] });
      } else {
        return res.status(401).json({ success: false, message: "PIN salah!" });
      }
    } else {
      // User belum ada, daftarkan PIN pertama kali
      const newUser = await db.insert(users).values({
        name: username,
        pin: pin,
      }).returning();
      
      return res.json({ success: true, message: "PIN berhasil didaftarkan", user: newUser[0] });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// SUBMIT VOTE API
app.post("/api/votes", async (req, res) => {
  const { username, urgensi, kesiapan_modal, opsi_eksekusi, skema_bayar, komitmen, catatan } = req.body;
  
  try {
    const user = await db.select().from(users).where(eq(users.name, username)).limit(1);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    const newVote = await db.insert(votes).values({
      userId: user[0].id,
      urgensi: urgensi,
      kesiapanModal: kesiapan_modal,
      opsiEksekusi: opsi_eksekusi,
      skemaBayar: skema_bayar,
      komitmen: komitmen,
      catatan: catatan
    }).returning();
    
    return res.json({ success: true, message: "Suara berhasil disimpan", vote: newVote[0] });
  } catch (error) {
    console.error("Vote error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET ALL VOTES API (For Admin)
app.get("/api/votes", async (req, res) => {
  try {
    // Join votes with users to get the name
    const allVotes = await db.select({
      id: votes.id,
      name: users.name,
      urgensi: votes.urgensi,
      kesiapanModal: votes.kesiapanModal,
      opsiEksekusi: votes.opsiEksekusi,
      skemaBayar: votes.skemaBayar,
      komitmen: votes.komitmen,
      catatan: votes.catatan,
      createdAt: votes.createdAt
    }).from(votes).leftJoin(users, eq(votes.userId, users.id));
    
    return res.json({ success: true, votes: allVotes });
  } catch (error) {
    console.error("Get votes error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
