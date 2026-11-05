
import multer from "multer";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

// Determine the project root directory.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDirectory = path.resolve(
  __dirname,
  "../../client/public/images/projects"
);

// Ensure the image directory exists.
fs.mkdirSync(uploadDirectory, { recursive: true });

// Limit uploaded images to 5 MB.
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Supported image formats.
const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

// Use memory storage until the file has been validated.
// This prevents unvalidated files from being written to disk.
const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },

  fileFilter(req, file, callback) {
    if (!allowedTypes.includes(file.mimetype)) {
      return callback(
        new Error("Only JPEG, PNG, and WebP images are allowed.")
      );
    }

    callback(null, true);
  },
});

// Validate the actual image signature.
// Do not rely exclusively on the browser-supplied MIME type.
function detectImageType(buffer) {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "jpg";
  }

  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
    )
  ) {
    return "png";
  }

  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }

  return null;
}

// Save a validated image using a server-generated filename.
async function saveProjectImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image to upload.",
      });
    }

    const extension = detectImageType(req.file.buffer);

    if (!extension) {
      return res.status(400).json({
        message: "Invalid image file.",
      });
    }

    const expectedMimeType = {
      jpg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
    }[extension];

    if (req.file.mimetype !== expectedMimeType) {
      return res.status(400).json({
        message: "Image content does not match its file type.",
      });
    }

    const filename = `project-${randomUUID()}.${extension}`;

    const destination = path.join(uploadDirectory, filename);

    await fs.promises.writeFile(
      destination,
      req.file.buffer,
      { flag: "wx" }
    );

    return res.status(201).json({
      message: "Image uploaded successfully.",
      image: `/images/projects/${filename}`,
    });

  } catch (error) {
    console.error("Image upload failed:", error);

    return res.status(500).json({
      message: "Unable to save the uploaded image.",
    });
  }
}

// Convert Multer errors into appropriate HTTP responses.
function handleUpload(req, res, next) {
  upload.single("image")(req, res, function (error) {
    if (error) {
      if (error instanceof multer.MulterError) {
        return res.status(400).json({
          message: error.message,
        });
      }

      return res.status(400).json({
        message: error.message,
      });
    }

    next();
  });
}

export { handleUpload, saveProjectImage };
