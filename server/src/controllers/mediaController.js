const {
  getMediaFile,
  openDownloadStream,
  toObjectId,
} = require("../services/mediaService");

const getMedia = async (req, res, next) => {
  try {
    const fileId = toObjectId(req.params.fileId);

    if (!fileId) {
      res.status(400);
      throw new Error("Invalid media file id");
    }

    const file = await getMediaFile(fileId);

    if (!file) {
      res.status(404);
      throw new Error("Media file not found");
    }

    const mimeType =
      file.contentType ||
      file.metadata?.mimeType ||
      "application/octet-stream";

    const fileSize = file.length;
    const rangeHeader = req.headers.range;

    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Content-Type", mimeType);
    res.setHeader(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );

    // Images and non-range requests: stream the full file.
    if (!rangeHeader || !mimeType.startsWith("video/")) {
      res.setHeader("Content-Length", fileSize);

      const downloadStream = openDownloadStream(fileId);

      downloadStream.on("error", (error) => {
        next(error);
      });

      downloadStream.pipe(res);
      return;
    }

    // Video Range support for seeking.
    const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);

    if (!match) {
      res.status(416);
      throw new Error("Invalid Range header");
    }

    const start = match[1] ? Number(match[1]) : 0;
    let end = match[2] ? Number(match[2]) : fileSize - 1;

    if (
      Number.isNaN(start) ||
      Number.isNaN(end) ||
      start < 0 ||
      start >= fileSize
    ) {
      res.status(416);
      res.setHeader(
        "Content-Range",
        `bytes */${fileSize}`
      );
      throw new Error("Requested range is not satisfiable");
    }

    end = Math.min(end, fileSize - 1);
    const chunkSize = end - start + 1;

    res.status(206);
    res.setHeader(
      "Content-Range",
      `bytes ${start}-${end}/${fileSize}`
    );
    res.setHeader("Content-Length", chunkSize);

    const downloadStream = openDownloadStream(fileId, {
      start,
      end: end + 1,
    });

    downloadStream.on("error", (error) => {
      next(error);
    });

    downloadStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedia,
};
