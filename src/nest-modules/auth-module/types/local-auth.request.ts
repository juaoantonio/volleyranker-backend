import { Request } from "@nestjs/common";

export interface LocalAuthRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}
