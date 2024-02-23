import AWS from "aws-sdk";
import "dotenv/config";
const config = process.env;

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

const listS3File = (bucket: any, url?: string) => {
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
          Expires: 60 * 5,// expires in 5 mins
        })
      );

      const signedUrls = await Promise.all(signedUrlsPromises);
      return resolve(signedUrls);
    } catch (err) {
      reject(err);
    }
  });
};

export { uploadFileToS3, listS3File };
