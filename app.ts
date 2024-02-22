import express from "express";
const app = express();
import winston from "winston";
import fileUpload from 'express-fileupload';
import { uploadFileToS3 } from "./castleblack";
import 'dotenv/config';
app.use(express.json())
app.use(fileUpload());

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    apiHitTime: new Date(Date.now()),
  });
  next();
});
app.get("/", (req, res) => {
  res.status(200).json({
    sucess: true,
    message: "Welcome to Lord Varys Little Birds Service",
    data: "NA",
  });
});

app.post("/castleblack", async (req:any, res) => {
  const file = req.files && req.files.file;
  if (!file) {
    throw new Error("Please pass all required parameters");
  }

  const extData = file.mimetype.split("/")[1];
  let file_name = file.name || "uuid.v4()" + "." + extData;
  file_name = file_name.replace(/\s+/g, " ");
  file_name = file_name.replace(/ /g, "_");
  file_name = file_name.replace(/\.+$/, "");
  const fileBucket = process.env.AWS_BUCKET_NAME;
  await uploadFileToS3(file, file_name, fileBucket);
  const fileUrl = process.env.AWS_PUBLIC_URL + file_name;
  res.status(200).json({
    sucess: true,
    message: "file uploaded succesfully",
    data: fileUrl,
  });
});

const PORT = process.env.port || 5000;
app.listen(PORT, () => {
  console.log(`Server started at PORT: ${PORT}`);
});
