const fs = require('fs');
const S3 = require('aws-sdk/clients/s3');
const dotenv = require('dotenv').config();
const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

function uploadFile(file) {
  console.log('Upload to ' + bucketName + ' Started');
  const fileStream = fs.createReadStream(file.path);

  const params = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename,
  };

  return s3.upload(params).promise();
}

function getFileStream(filekey) {
  const params = {
    Key: filekey,
    Bucket: bucketName,
  };

  return s3.getObject(params).createReadStream();
}

function deleteFile(fileKey) {
  const params = {
    Bucket: bucketName,
    Key: fileKey,
  };

  return s3.deleteObject(params).promise();
}

exports.uploadFile = uploadFile;
exports.getFileStream = getFileStream;
exports.awsDeleteFile = deleteFile;
