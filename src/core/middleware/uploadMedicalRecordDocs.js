import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "src/core/uploads/medical_records",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }
  cb(null, true);
};

export const uploadMedicalRecordDocument = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB
  },
  fileFilter,
});
