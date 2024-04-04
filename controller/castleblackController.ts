import castleblackService from "../services/castleblackService";
import "dotenv/config";
const config = process.env;
import * as castleBlackConstant from "../castleblackConstants";

const upload = async (req: any, res: any) => {
  try {
    const file = req.files && req.files.file;
    if (!file) {
      throw new Error("Please pass all required parameters");
    }
    const username = req.body && req.body.userName;
    const extData = file.mimetype.split("/")[1];
    let file_name = file.name || "uuid.v4()" + "." + extData;
    file_name = file_name.replace(/\s+/g, " ");
    file_name = file_name.replace(/ /g, "_");
    file_name = file_name.replace(/\.+$/, "");
    const fileBucket = config.AWS_BUCKET_NAME;
    await castleblackService.uploadFile(file, file_name, fileBucket, username);
    const fileUrl = config.AWS_PUBLIC_URL + file_name;
    res.status(200).json({
      sucess: true,
      message: "file uploaded succesfully",
      data: fileUrl,
    });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error,
      error: "Error while uploading file to S3",
    });
  }
};
const listFile = async (req: any, res: any) => {
  try {
    const result = await castleblackService.listFile(config.AWS_BUCKET_NAME);
    res.status(200).json({
      sucess: true,
      message: "file fetched succesfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error,
      error: "Error while listing file from S3",
    });
  }
};
const processFinalWaterMark = async (req: any, res: any) => {
  try {
    const payload = req.body;
    const result = await castleblackService.processFinalWaterMark(payload);
    res.status(200).json({
      sucess: true,
      message: "Processed Watermark on File succesfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error,
      error: "Error while processing watermark on file",
    });
  }
};

export default {
  upload,
  listFile,
  processFinalWaterMark,
};
