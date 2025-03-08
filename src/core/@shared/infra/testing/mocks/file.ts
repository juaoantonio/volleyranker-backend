import { ImageFile } from "@core/@shared/infra/types";

export class ImageMockBuilder {
  private readonly image: ImageFile;

  constructor(props: Partial<ImageFile> = {}) {
    this.image = {
      fieldname: props.fieldname ?? "image",
      originalname: props.originalname ?? "test",
      encoding: props.encoding ?? "7bit",
      mimetype: props.mimetype ?? "image/png",
      destination: props.destination ?? "test",
      filename: props.filename ?? "test",
      size: props.size ?? 100,
      stream: null,
      path: props.path ?? "test",
      buffer: props.buffer ?? Buffer.from("test"),
    };
  }

  public withFieldname(fieldname: string): this {
    this.image.fieldname = fieldname;
    return this;
  }

  public withOriginalname(originalname: string): this {
    this.image.originalname = originalname;
    return this;
  }

  public withEncoding(encoding: string): this {
    this.image.encoding = encoding;
    return this;
  }

  public withMimetype(mimetype: string): this {
    this.image.mimetype = mimetype;
    return this;
  }

  public withDestination(destination: string): this {
    this.image.destination = destination;
    return this;
  }

  public withFilename(filename: string): this {
    this.image.filename = filename;
    return this;
  }

  public withSize(size: number): this {
    this.image.size = size;
    return this;
  }

  public withStream(stream: any): this {
    this.image.stream = stream;
    return this;
  }

  public withPath(path: string): this {
    this.image.path = path;
    return this;
  }

  public withBuffer(buffer: Buffer): this {
    this.image.buffer = buffer;
    return this;
  }

  public build(): ImageFile {
    return this.image;
  }
}
