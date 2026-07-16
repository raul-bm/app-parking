import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import pinRoutes from "./routes/pin.routes";
import friendshipRoutes from "./routes/friendship.routes";
import groupRoutes from "./routes/group.routes";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/pins", pinRoutes);
app.use("/friendships", friendshipRoutes);
app.use("/groups", groupRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http:localhost:${PORT}`);
});
