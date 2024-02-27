import express from "express";
const app = express();
import winston from "winston";
import fileUpload from "express-fileupload";
import cors from "cors"
import { uploadFileToS3, listS3File, processWateronFile } from "./castleblack";
import "dotenv/config";
app.use(express.json());
app.use(fileUpload());
app.use(cors())
const config = process.env;

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
    filename: 'logs/info.log',
  }),],
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
app.get("/", async(req, res) => {
  await processWateronFile()
  res.status(200).json({
    sucess: true,
    message: "Welcome to Lord Varys Little Birds Service",
    data: "NA",
  });
});

app.post("/castleblack/upload", async (req: any, res) => {
  try {
    const file = req.files && req.files.file;
    if (!file) {
      throw new Error("Please pass all required parameters");
    }
    const extData = file.mimetype.split("/")[1];
    let file_name = file.name || "uuid.v4()" + "." + extData;
    file_name = file_name.replace(/\s+/g, " ");
    file_name = file_name.replace(/ /g, "_");
    file_name = file_name.replace(/\.+$/, "");
    const fileBucket = config.AWS_BUCKET_NAME;
    await uploadFileToS3(file, file_name, fileBucket);
    const fileUrl = config.AWS_PUBLIC_URL + file_name;
    res.status(200).json({
      sucess: true,
      message: "file uploaded succesfully",
      data: fileUrl,
    });
  } catch (error) {
    throw error;
  }
});

app.get("/castleblack/file", async (req: any, res) => {
  try {
    const result = await listS3File(config.AWS_BUCKET_NAME);
    res.status(200).json({
      sucess: true,
      message: "file fetched succesfully",
      data: result,
    });
  } catch (error) {
    throw error;
  }
});

const PORT = process.env.port || 5000;
app.listen(PORT, () => {
  console.log(`Server started at PORT: ${PORT}`);
});
