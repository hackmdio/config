import { IProvider } from '../interfaces';

export default class ConfigFileProvider implements IProvider {
  public resolve(parameter: string): void {
    console.log(`file provider - ${parameter}`);
  }

}
