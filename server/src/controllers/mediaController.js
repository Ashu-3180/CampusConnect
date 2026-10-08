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
    // Supports: bytes=0-999 | bytes=1000- | bytes=-500
    const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
    const sendUnsatisfiable = () => {
      res.status(416);
      res.setHeader("Content-Range", `bytes */${fileSize}`);
      throw new Error("Requested range is not satisfiable");
    };

    if (!match || (!match[1] && !match[2])) {
      sendUnsatisfiable();
    }

    let start;
    let end;

    if (!match[1]) {
      // Suffix range: bytes=-N → last N bytes
      const suffixLength = Number(match[2]);

      if (
        Number.isNaN(suffixLength) ||
        suffixLength <= 0 ||
        fileSize === 0
      ) {
        sendUnsatisfiable();
      }

      start = Math.max(fileSize - suffixLength, 0);
      end = fileSize - 1;
    } else {
      start = Number(match[1]);
      end = match[2] ? Number(match[2]) : fileSize - 1;

      if (
        Number.isNaN(start) ||
        Number.isNaN(end) ||
        start < 0 ||
        start >= fileSize ||
        end < start
      ) {
        sendUnsatisfiable();
      }

      // Clamp open or oversized end to the last valid byte.
      end = Math.min(end, fileSize - 1);
    }

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
