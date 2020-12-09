interface ResetMailOptions {
  username: string;
  resetLink: string;
}

interface HelloMailOptions {
  username: string;
}

export interface CustomSendMailOptions {
  template: 'hello' | 'passwordReset';
  values: HelloMailOptions | ResetMailOptions;
}
