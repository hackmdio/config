export interface ISetting {
  type: string;
  providers: string[];
}

export interface IProvider {
  resolve(parameter: string): void;
}
