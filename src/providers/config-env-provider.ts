import { IProvider } from '../interfaces';

export default class ConfigEnvProvider implements IProvider {
  public resolve(parameter: string): void {
    // console.log(`env provider - ${parameter}`);
  }
}
