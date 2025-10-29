import { Router } from "express";
import financeRoutes from "./finance";

const router = Router();

router.use("/finance", financeRoutes);

router.get("/", (_req, res) => {
  res.json({ message: "Portfolio API - healthy" });
});

export default router;
