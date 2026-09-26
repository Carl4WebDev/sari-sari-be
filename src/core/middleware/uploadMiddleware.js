import multer from "multer";
import path from "path";
import fs from "fs";

const borrowerUploadPath = "uploads/borrowers";

if (!fs.existsSync(borrowerUploadPath)) {
  fs.mkdirSync(borrowerUploadPath, { recursive: true });
}

// Allowed extensions and their magic bytes (file signatures)
const ALLOWED_TYPES = {
  ".jpg":  [0xFF, 0xD8, 0xFF],
  ".jpeg": [0xFF, 0xD8, 0xFF],
  ".png":  [0x89, 0x50, 0x4E, 0x47],
  ".webp": [0x52, 0x49, 0x46, 0x46], // RIFF header (first 4 bytes of WebP)
};

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, borrowerUploadPath);
  },
  filename: (req, file, cb) => {
    // Sanitize: strip everything except alphanumeric + extension
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // Reject if extension is not in allowlist
  if (!ALLOWED_TYPES[ext]) {
    return cb(new Error("Only .jpg, .jpeg, .png, and .webp images are allowed"), false);
  }

  // Reject if MIME type doesn't match
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(new Error("Invalid image file type"), false);
  }

  cb(null, true);
};

export const uploadBorrowerProfile = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1, // Only 1 file per request
  },
});

/**
 * Verify uploaded file's magic bytes match the claimed extension.
 * Call this after multer processes the file.
 */
export function verifyFileSignature(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const expectedSig = ALLOWED_TYPES[ext];
    if (!expectedSig) return false;

    const fd = fs.openSync(filePath, "r");
    const buf = Buffer.alloc(expectedSig.length);
    fs.readSync(fd, buf, 0, expectedSig.length, 0);
    fs.closeSync(fd);

    return expectedSig.every((byte, i) => buf[i] === byte);
  } catch {
    return false;
  }
}
