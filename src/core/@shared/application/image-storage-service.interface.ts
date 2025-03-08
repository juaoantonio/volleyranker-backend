export interface IImageStorageService {
  upload(fileName: string, file: Buffer, mimetype: string): Promise<string>;

  delete(fileKey: string): Promise<void>;

  getPreSignedUrl(fileKey: string, expiresInSeconds?: number): Promise<string>;
}
