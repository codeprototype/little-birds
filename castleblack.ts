import AWS from "aws-sdk";
import "dotenv/config";
const config = process.env;
import * as Jimp from "jimp";

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
  name: any,
  bucket: any = null,
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
    console.log("????", objectParams);
    if (nocache) {
      objectParams["CacheControl"] = "no-cache";
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
      return resolve(signedUrls);
    } catch (err) {
      reject(err);
    }
  });
};

const processWateronFile = async () => {
  const bucketName = config.AWS_BUCKET_NAME;
  const inputFileName =
    "https://littlebirds-varys.s3.ap-south-1.amazonaws.com/1.jpg";
  const outputFileName = "output-file-name.jpg";
  try {
    let image = await Jimp.read(inputFileName);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    image = await image.print(font, 100, 100, "King of the North!");
    const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);
    await s3
      .putObject({
        Bucket: bucketName!,
        Key: outputFileName,
        Body: buffer,
        ACL: "public-read",
        ContentType: "image/jpeg",
      })
      .promise();

    console.log("Watermarked file uploaded successfully!");
  } catch (error) {
    console.error("Error processing or uploading image:", error);
  }
};

const processImageWatermark = async () => {
  const watermarkX = 10;
  const watermarkY = 10;
  const sourceBucket = config.AWS_BUCKET_NAME;
  const sourceKey = "1.jpg";
  const watermarkBucket = config.AWS_BUCKET_NAME;
  const watermarkKey = "watermark_image.png"; // PNG with transparency for watermark
  const outputBucket = config.AWS_BUCKET_NAME;
  const outputKey = "output-image-part2.jpg";

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
    let finalImageBuffer = await sourceImage.getBufferAsync(Jimp.MIME_JPEG);
    await s3
      .putObject({
        Bucket: outputBucket!,
        Key: outputKey,
        Body: finalImageBuffer,
        ACL: "public-read",
        ContentType: "image/jpeg",
      })
      .promise();

    console.log("Image processing complete. Final image uploaded to S3.");
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
export {
  uploadFileToS3,
  listS3File,
  processWateronFile,
  processImageWatermark,
};
