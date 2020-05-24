import path from 'path';
import crypto from 'crypto';
import multer from 'multer';

const tmpFolder = path.resolve(__dirname, '..', '..', 'tmp');

const uploadConfig = {
  directory: tmpFolder,
  storage: multer.diskStorage({
    destination: tmpFolder,
    filename(req, file, cb) {
      const hash = crypto.randomBytes(10).toString('HEX');
      const name = `${hash}-${file.originalname}`;

      return cb(null, name);
    },
  }),
};

export default uploadConfig;
