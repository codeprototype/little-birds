import express from "express";
const router = express.Router();
import castleblackController from "../controller/castleblackController";

router.post(
  "/castleblack/process-watermark-image",
  castleblackController.processWaterMark
);
router.post("/castleblack/upload", castleblackController.upload);
router.get("/castleblack/file", castleblackController.listFile);
export default router;
