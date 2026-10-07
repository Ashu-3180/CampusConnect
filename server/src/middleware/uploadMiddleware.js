const multer = require("multer");

const storage = multer.memoryStorage();

const profileImageFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, PNG, WEBP and GIF images are allowed."
      ),
      false
    );
  }
};

const postMediaFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/webm",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, PNG, WEBP images or MP4/WEBM videos are allowed."
      ),
      false
    );
  }
};

const uploadProfileImage = multer({
  storage,
  fileFilter: profileImageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const uploadPostMedia = multer({
  storage,
  fileFilter: postMediaFilter,
  limits: {
    // Allow up to video limit; image size is re-checked in the controller.
    fileSize: 50 * 1024 * 1024,
  },
});

module.exports = {
  uploadProfileImage,
  uploadPostMedia,
};
