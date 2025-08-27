import express from "express";
import { getFile, saveFile } from "../controllers/fileController.js";

const router = express.Router();

router.get("/file", getFile);
router.post("/save-file", saveFile);

export default router;
