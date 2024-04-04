import express from "express";
const app = express();
import fileUpload from "express-fileupload";
import cors from "cors";
app.use(express.json());
app.use(fileUpload());
app.use(cors());
import logger from "./modules/loggerModule";
import castleblack from "./routes/castleblack"
import connection from "./modules/dbconnection"
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    apiHitTime: new Date(Date.now()),
  });
  next();
});
app.get("/", async (req, res) => {
  res.status(200).json({
    sucess: true,
    message: "Welcome to Lord Varys Little Birds Service",
    data: "HealthCheck OK!",
  });
});
app.use(castleblack)
const PORT = process.env.port || 5000;
app.listen(PORT, () => {
  console.log(`Server started at PORT: ${PORT}`);
});
