import express from "express";
import { proxyHandler } from "../controllers/proxyController.js";

const router = express.Router();

router.get("/proxy", proxyHandler);

export default router;
