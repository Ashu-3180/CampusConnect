const mongoose = require("mongoose");
const { GridFSBucket, ObjectId } = require("mongodb");

const BUCKET_NAME = "campusconnect_media";

let bucket = null;

const getBucket = () => {
  if (bucket) {
    return bucket;
  }

  if (!mongoose.connection?.db) {
    throw new Error("MongoDB is not connected");
  }

  bucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: BUCKET_NAME,
  });

  return bucket;
};

const toObjectId = (fileId) => {
  if (!fileId) {
    return null;
  }

  if (fileId instanceof ObjectId) {
    return fileId;
  }

  if (!ObjectId.isValid(String(fileId))) {
    return null;
  }

  return new ObjectId(String(fileId));
};

/**
 * Upload a Buffer to GridFS.
 * @returns {{ fileId: ObjectId, filename: string, mimeType: string, size: number }}
 */
const uploadMedia = ({
  buffer,
  filename,
  mimeType,
  metadata = {},
}) =>
  new Promise((resolve, reject) => {
    if (!buffer || !Buffer.isBuffer(buffer)) {
      reject(new Error("A valid media buffer is required"));
      return;
    }

    const mediaBucket = getBucket();
    const uploadStream = mediaBucket.openUploadStream(
      filename || `media-${Date.now()}`,
      {
        contentType: mimeType || "application/octet-stream",
        metadata: {
          ...metadata,
          uploadedAt: new Date(),
        },
      }
    );

    uploadStream.on("error", reject);
    uploadStream.on("finish", () => {
      resolve({
        fileId: uploadStream.id,
        filename: uploadStream.filename,
        mimeType: mimeType || "application/octet-stream",
        size: buffer.length,
      });
    });

    uploadStream.end(buffer);
  });

/**
 * Find a GridFS file document by id.
 */
const getMediaFile = async (fileId) => {
  const id = toObjectId(fileId);

  if (!id) {
    return null;
  }

  const mediaBucket = getBucket();
  const files = await mediaBucket.find({ _id: id }).toArray();

  return files[0] || null;
};

/**
 * Open a readable download stream for a GridFS file.
 */
const openDownloadStream = (fileId, options = {}) => {
  const id = toObjectId(fileId);

  if (!id) {
    throw new Error("Invalid media file id");
  }

  return getBucket().openDownloadStream(id, options);
};

/**
 * Delete a GridFS file by id. Ignores missing files.
 */
const deleteMedia = async (fileId) => {
  const id = toObjectId(fileId);

  if (!id) {
    return false;
  }

  try {
    await getBucket().delete(id);
    return true;
  } catch (error) {
    if (
      error?.message?.includes("FileNotFound") ||
      error?.codeName === "FileNotFound"
    ) {
      return false;
    }

    throw error;
  }
};

module.exports = {
  BUCKET_NAME,
  toObjectId,
  uploadMedia,
  getMediaFile,
  openDownloadStream,
  deleteMedia,
};
