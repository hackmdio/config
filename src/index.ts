import * as fs from 'fs';
import * as path from 'path';
import { IProvider, ISetting } from './interfaces';

type ProviderCache = Map<string, IProvider>;

export class Config {
  private readonly executionDirectory: string;
  private setting!: ISetting;
  private typeFile!: any;
  private providerClass: ProviderCache = new Map<string, IProvider>();

  constructor() {
    this.executionDirectory = this.getExecutionDirectory();
    this.initialize();
    this.loadDefaultProvider();
  }

  public registerProvider(providerName: string, providerClass: IProvider, force = false) {
    if (this.providerClass.has(providerName) && !force) {
      // tslint:disable-next-line
      throw new Error(`config: ${providerName} already exists, set "force" parameter if you want to override it.`);
    }
    this.providerClass.set(providerName, providerClass);
  }

  public async buildAsync() {
    for (const provider of this.setting.providers) {
      const [providerName, parameter] = provider.split(':');
      const providerClass = this.resolveProvider(providerName);
      // @ts-ignore
      const p = new providerClass();
      p.resolve(parameter);
    }
  }

  private initialize() {
    this.fetchSetting();
    this.fetchTypeFile();
  }

  private fetchSetting() {
    const pkg = path.resolve(this.executionDirectory, 'package.json');
    if (!fs.existsSync(pkg)) {
      throw new Error(`config: file not exists in ${pkg}`);
    }
    const pkgData = require(pkg);
    if (!pkgData.config) {
      throw new Error(`config: cannot found config setting in package.json (${pkg})`);
    }
    this.setting = pkgData.config;
  }

  private fetchTypeFile() {
    const typeFilePath = path.resolve(this.executionDirectory, this.setting.type);
    if (!fs.existsSync(typeFilePath)) {
      throw new Error(`config: cannot found typefile in path ${typeFilePath}`);
    }
    this.typeFile = require(typeFilePath);
  }

  private loadDefaultProvider() {
    this.registerProvider('file', require('./providers/config-file-provider').default);
    this.registerProvider('env', require('./providers/config-env-provider').default);
    this.registerProvider(
      'dockerSecret',
      require('./providers/config-docker-secret-provider').default,
    );
  }

  private getExecutionDirectory(): string {
    if (process.mainModule) {
      return path.dirname(process.mainModule.paths[0]);
    }
    if (module) {
      let currentModule = module;
      while (currentModule.parent) {
        currentModule = currentModule.parent;
      }
      return path.dirname(currentModule.paths[0]);
    }
    if (process.argv.length > 1) {
      return path.dirname(process.argv[1]);
    }
    return path.dirname(process.argv[0]);
  }

  private resolveProvider(providerName: string): IProvider {
    if (this.providerClass.has(providerName)) {
      return this.providerClass.get(providerName) as IProvider;
    }
    const tryPkgName = [
      `@hackmd/config-${providerName}-provider`,
      `@hackmd/config-provider-${providerName}`,
      `config-${providerName}-provider`,
      `config-provider-${providerName}`,
      `${providerName}`,
      path.resolve(this.executionDirectory, providerName),
    ];

    for (const pkg of tryPkgName) {
      if (this.tryToResolvePackage(pkg)) {
        const importedPkg = require(pkg);
        if (importedPkg.default) {
          this.registerProvider(providerName, importedPkg.default);
        } else {
          this.registerProvider(providerName, importedPkg);
        }
        return this.providerClass.get(providerName) as IProvider;
      }
    }
    throw new Error(`config: could not resolve provider "${providerName}"`);
  }

  private tryToResolvePackage(pkgName: string): boolean {
    try {
      require.resolve(pkgName);
      return true;
    } catch (e) {
      return false;
    }
  }
}

export default new Config();
