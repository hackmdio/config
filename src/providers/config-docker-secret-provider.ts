import { IProvider } from '../interfaces';

export default class ConfigDockerSecretProvider implements IProvider {
  public resolve(parameter: string): void {
    // console.log(`docker secret provider - ${parameter}`);
  }
}
