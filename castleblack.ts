import AWS from "aws-sdk";
import "dotenv/config";
const config = process.env;
import * as Jimp from "jimp";
import logger from "./modules/loggerModule";
import * as castleBlackConstant from "./castleblackConstants";

export interface awsData {
  IsTruncated: boolean;
  Contents: Content[];
  Name: string;
  Prefix: string;
  MaxKeys: number;
  CommonPrefixes: any[];
  KeyCount: number;
}

export interface Content {
  Key: string;
  LastModified: string;
  ETag: string;
  ChecksumAlgorithm: any[];
  Size: number;
  StorageClass: string;
}

AWS.config.update({
  accessKeyId: config.AWS_ACCESS_KEY,
  secretAccessKey: config.AWS_SECRET_KEY,
  region: config.AWS_REGION,
});

const s3 = new AWS.S3();

const uploadFileToS3 = async (
  file: any,
  name: string,
  bucket: any = null,
  isWatermarkProcessable: boolean,
  userName: string,
  nocache = null
) => {
  return new Promise(async (resolve, reject) => {
    let s3_bucket = config.AWS_BUCKET_NAME;
    if (bucket) {
      s3_bucket = bucket;
    }
    let objectParams: any = {
      Bucket: s3_bucket,
      Key: name,
      Body: file.data,
      ContentType: file.mimetype,
      ACL: "public-read",
    };
    if (nocache) {
      objectParams["CacheControl"] = "no-cache";
    }
    if (isWatermarkProcessable) {
      objectParams = await processImageWatermark(name, userName);
    }
    s3.putObject(objectParams)
      .promise()
      .then((res) => {
        resolve(true);
      })
      .catch((err) => {
        console.error("Error in uploadFileToS3: " + err.stack);
        reject(err);
      });
  });
};

const listS3File = (bucket: any, key?: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await s3.listObjectsV2({ Bucket: bucket }).promise();
      const keys = data.Contents?.map((obj) => obj.Key) || [];
      if (keys.length === 0) {
        console.log("No objects found in the bucket.");
        return [];
      }

      const signedUrlsPromises = keys.map((key) =>
        s3.getSignedUrlPromise("getObject", {
          Bucket: bucket,
          Key: key,
          Expires: 60 * 5, // expires in 5 mins
        })
      );
      const signedUrls = await Promise.all(signedUrlsPromises);
      return resolve({
        data: signedUrls,
        keys:keys
      });
    } catch (err) {
      reject(err);
    }
  });
};

const processImageWatermark = async (filename: any, username: any) => {
  const watermarkX = castleBlackConstant.watermarkX;
  const watermarkY = castleBlackConstant.watermarkY;
  const sourceBucket = config.AWS_BUCKET_NAME;
  const sourceKey = filename;
  const watermarkBucket = config.AWS_BUCKET_NAME;
  const watermarkKey = castleBlackConstant.watermarkKey;
  const outputBucket = config.AWS_BUCKET_NAME;
  const outputFolder = castleBlackConstant.outputFolder;

  try {
    // Process the images and insert watermark
    let [sourceImageBuffer, watermarkImageBuffer]: any = await Promise.all([
      downloadImage(sourceBucket, sourceKey),
      downloadImage(watermarkBucket, watermarkKey),
    ]);

    let [sourceImage, watermarkImage] = await Promise.all([
      Jimp.read(sourceImageBuffer),
      Jimp.read(watermarkImageBuffer),
    ]);

    sourceImage = await sourceImage.composite(
      watermarkImage,
      watermarkX,
      watermarkY,
      {
        mode: Jimp.BLEND_OVERLAY,
        opacitySource: 0.5,
        opacityDest: 0.5,
      }
    );
    sourceImage = await processTextWaterMark(sourceImage, username);
    let finalImageBuffer = await sourceImage.getBufferAsync(Jimp.MIME_JPEG);
    logger.info("Image processing complete. Final image uploaded to S3.");

    let objectParams= {
      Bucket: outputBucket!,
      Key: outputFolder+filename,
      Body: finalImageBuffer,
      ACL: "public-read",
      ContentType: "image/jpeg",
    };
    await s3.putObject(objectParams)
    .promise()
    return true
   
  } catch (error) {
    console.error("Error:", error);
  }
};
const downloadImage = (bucket: any, key: any) => {
  return new Promise((resolve, reject) => {
    s3.getObject({ Bucket: bucket, Key: key }, (err, data) => {
      if (err) reject(err);
      else resolve(data.Body);
    });
  });
};
const processTextWaterMark = async (sourceImage: any, username: string) => {
  try {
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    let sourceImageBuffer = await sourceImage.print(font, 150, 220, username);
    logger.info("Watermarked file uploaded successfully!");
    return sourceImageBuffer;
  } catch (error) {
    console.error("Error processing or  image:", error);
  }
};
export {
  uploadFileToS3,
  listS3File,
  processTextWaterMark,
  processImageWatermark,
};
