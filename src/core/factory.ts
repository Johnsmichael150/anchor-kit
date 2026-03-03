import { AnchorKitConfig } from '../types/config';
import { AnchorConfig } from './config';
import { AnchorPlugin } from '../types/plugin';

/**
 * AnchorInstance
 * Represents the core SDK instance controlling the anchor's behavior.
 */
export class AnchorInstance {
  public readonly config: AnchorConfig;
  private plugins: Map<string, AnchorPlugin> = new Map();

  constructor(config: Partial<AnchorKitConfig>) {
    this.config = new AnchorConfig(config);
    this.config.validate();
  }

  /**
   * Register a plugin with the anchor instance.
   */
  public use(plugin: AnchorPlugin): this {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin with id "${plugin.id}" is already registered.`);
    }
    this.plugins.set(plugin.id, plugin);
    return this;
  }

  /**
   * Initialize all registered plugins and core services.
   */
  public async init(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (plugin.init) {
        await plugin.init(this);
      }
    }
  }

  /**
   * Get a registered plugin by its ID.
   */
  public getPlugin<T extends AnchorPlugin>(id: string): T | undefined {
    return this.plugins.get(id) as T;
  }
}

/**
 * createAnchor
 * Factory function to initialize a new Anchor-Kit instance.
 *
 * @param config - Initial configuration object
 * @returns An initialized AnchorInstance
 */
export function createAnchor(config: Partial<AnchorKitConfig>): AnchorInstance {
  return new AnchorInstance(config);
}
