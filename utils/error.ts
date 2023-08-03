export class CustomError extends Error {
  statusCode: number;
  data?: string[]; //{ msg: string; path: string }[];

  constructor(
    statusCode: number,
    message: string,
    data?: string[] //{ msg: string; path: string }[]
  ) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);
    this.name = Error.name;
    this.statusCode = statusCode;
    this.data = data;
    Error.captureStackTrace(this);
  }
}
