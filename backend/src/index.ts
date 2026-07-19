import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import pinRoutes from "./routes/pin.routes";
import friendshipRoutes from "./routes/friendship.routes";
import groupRoutes from "./routes/group.routes";
import userRoutes from "./routes/user.routes";

const app = express();

app.use(
  cors({
    origin: [
      "https://app-parking-raulbm.numinformatica.com",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    credentials: true,
  }),
);
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/pins", pinRoutes);
app.use("/friendships", friendshipRoutes);
app.use("/groups", groupRoutes);
app.use("/users", userRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http:localhost:${PORT}`);
});
