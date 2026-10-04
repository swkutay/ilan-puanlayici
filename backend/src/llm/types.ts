export interface LlmClient {
  complete(args: {
    apiKey: string;
    system: string;
    user: string;
  }): Promise<string>;
}

export class LlmError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}
