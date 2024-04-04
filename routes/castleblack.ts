import express from "express";
const router = express.Router();
import castleblackController from "../controller/castleblackController";

router.post("/castleblack/upload", castleblackController.upload);
router.get("/castleblack/file", castleblackController.listFile);
router.post(
  "/castleblack/process-final-watermark",
  castleblackController.processFinalWaterMark
);

export default router;
