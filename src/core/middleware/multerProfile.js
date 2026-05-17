import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "uploads/profile",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Invalid image format"), false);
};

export default multer({ storage, fileFilter });
