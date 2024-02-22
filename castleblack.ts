import AWS from "aws-sdk";
import 'dotenv/config';
const config = process.env;

AWS.config.update({
  accessKeyId: config.AWS_ACCESS_KEY,
  secretAccessKey: config.AWS_SECRET_KEY,
  region: config.AWS_REGION,
});

const s3 = new AWS.S3();

const uploadFileToS3 = async (
  file: any,
  name: any,
  bucket:any = null,
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
    console.log("????", objectParams)
    if (nocache) {
      objectParams["CacheControl"] = "no-cache";
    }
    new AWS.S3()
      .putObject(objectParams)
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

const s3UrlToBuffer = (bucket: string, url: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      s3.getObject(
        {
          Bucket: bucket,
          Key: url,
        },
        function (err, data) {
          if (err) return reject(err);
          else return resolve(data);
        }
      );
    } catch (err) {
      reject(err);
    }
  });
};

export  {
  uploadFileToS3,
  s3UrlToBuffer,
};
