import {
  BadRequestException,
  Injectable,
  type PipeTransform
} from '@nestjs/common';
import { ReadStream } from 'fs';

import { validateFileFormat, validateFileSize } from '../utils/file.util';

interface UploadedFile {
  filename: string;
  createReadStream: () => ReadStream;
}

@Injectable()
export class FileValidationPipe implements PipeTransform {
  public async transform(value: UploadedFile) {
    if (!value.filename) {
      throw new BadRequestException('File is required');
    }

    const { filename, createReadStream } = value;

    const fileStream = createReadStream();

    const allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const isFileFormatValid = validateFileFormat(filename, allowedFormats);

    if (!isFileFormatValid) {
      throw new BadRequestException('Invalid file format');
    }

    const isFileSizeValid = await validateFileSize(
      fileStream,
      10 * 1024 * 1024
    );

    if (!isFileSizeValid) {
      throw new BadRequestException('File size is too large');
    }

    return value;
  }
}
