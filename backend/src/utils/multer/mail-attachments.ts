import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD = 'uploads/mail-attachments';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLocaleLowerCase().split(' ').join('-');
    cb(null, uuidv4() + '-' + fileName);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const acceptedMimeTypes = [
      'image/png',
      'image/jpg',
      'image/jpeg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed'
    ];
    if (acceptedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(
        new Error(
          'Only .png, .jpg, .jpeg, .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt, .csv, .zip, .rar, application/zip,application/x-rar-compressed format allowed!'
        )
      );
    }
  }
}).fields([{ name: 'attachments', maxCount: 5 }]);

export default upload;
