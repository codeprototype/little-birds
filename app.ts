import express from "express";
const app = express();
import winston from "winston";
import castleBlack from "./castleblack";

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
    responseTime: Date.now()
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

const PORT = process.env.port || 5000;
app.listen(PORT, () => {
  console.log(`Server started at PORT: ${PORT}`);
});
