import { ReadStream } from 'fs';

export function validateFileFormat(
  fileName: string,
  allowedFileFormats: string[]
) {
  const extension = fileName.split('.').pop();

  if (!extension) {
    return false;
  }

  return allowedFileFormats.includes(extension);
}

export function validateFileSize(
  fileStream: ReadStream,
  allowedFileSizeInBytes: number
) {
  return new Promise((resolve, reject) => {
    let fileSizeInBytes = 0;

    fileStream
      .on('data', (data: Buffer) => {
        fileSizeInBytes = data.byteLength;
      })
      .on('end', () => {
        resolve(fileSizeInBytes <= allowedFileSizeInBytes);
      })
      .on('error', err => reject(err));
  });
}
