import AWS from "aws-sdk";
import fs from "fs";
const config = process.env;

AWS.config.update({
  accessKeyId: config.AWS_ACCESS_KEY,
  secretAccessKey: config.AWS_SECRET_KEY,
  region: config.AWS_REGION,
});

const s3 = new AWS.S3();
// const castleBlack =async (params:type) => {

function uploadFileToS3Bucket(
  fileToBeUploaded: string,
  bucket_name: string,
  filename: string,
  ContentType: any = null
) {
  return new Promise((resolve, reject) => {
    fs.readFile(fileToBeUploaded, function (error, file_buffer) {
      if (error) {
        return reject(error);
      }
      var params = {
        Bucket: bucket_name,
        Key: filename,
        Body: file_buffer,
        ACL: "public-read",
        ContentType: ContentType || "application/pdf",
      };
      s3.putObject(params, function (err, data) {
        if (err) {
          return reject(err);
        }
        return resolve(true);
      });
    });
  });
}

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

export default {
  uploadFileToS3Bucket,
  s3UrlToBuffer,
};
