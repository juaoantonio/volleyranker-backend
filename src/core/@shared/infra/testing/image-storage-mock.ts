import { IImageStorageService } from "@core/@shared/application/image-storage-service.interface";

export class ImageStorageServiceMock implements IImageStorageService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async upload(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fileName: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    file: Buffer,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mimetype: string,
  ): Promise<string> {
    return "images/image.jpg";
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async delete(fileKey: string): Promise<void> {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getPreSignedUrl(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fileKey: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    expiresInSeconds: number,
  ): Promise<string> {
    return "https://image.com/images/image.jpg";
  }
}
