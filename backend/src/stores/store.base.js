const fs = require('fs').promises;
const path = require('path');
const socketIOService = require("../services/socket-io.service");
const memoryCache = require("../services/memory.cache");

class StoreBase {
  constructor(modelName, modelPrefix) {
    this.modelName = modelName;
    this.modelPrefix = modelPrefix;
  }

  async create(data) {
    const now = new Date();

    // Generate a unique ID if not provided
    data.id = data.id || `${ now.getTime() }`;

    // Add creation timestamp
    data.createdAt = now.toISOString();

    // Prepare data before saving
    await this.prepareBeforeSave(data);

    const dataDir = await this.getDataDir();
    const fileName = `${ this.modelPrefix }_${ data.id }.json`;
    const filePath = path.join(dataDir, fileName);

    memoryCache.set(data.id, data);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    socketIOService.io.emit(`${ this.modelPrefix }-created`, data);

    return data;
  }

  async update(id, data) {
    const itemFilePath = await this.getItemFilePath(id);

    const existingItem = await this.getById(id);

    const updatedItem = {
      ...existingItem,
      ...data,
      updatedAt: new Date().toISOString()
    };

    updatedItem.id = id;

    // Prepare data before saving
    await this.prepareBeforeSave(updatedItem);
    memoryCache.set(id, updatedItem);
    await fs.writeFile(itemFilePath, JSON.stringify(updatedItem, null, 2));
    socketIOService.io.emit(`${ this.modelPrefix }-updated`, updatedItem);

    return updatedItem;
  }

  async prepareBeforeSave(data) {
    return data;
  }

  async getById(id) {
    const cachedItem = memoryCache.get(id);
    if (cachedItem) return cachedItem;

    const filePath = await this.getItemFilePath(id);
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const item = JSON.parse(content);
      // Store in cache
      memoryCache.set(id, item);
      return item;
    } catch (error) {
      return null;
    }
  }

  async list() {
    const dataDir = await this.getDataDir();
    const files = await fs.readdir(dataDir);

    const items = [];
    for (const file of files) {
      if (file.startsWith(`${ this.modelPrefix }_`) && file.endsWith('.json')) {
        const id = file.replace(`${ this.modelPrefix }_`, '').replace('.json', '');
        const item = await this.getById(id);
        if (item) items.push(item);
      }
    }

    return items;
  }

  async getItemFilePath(id) {
    const dataDir = await this.getDataDir();
    return path.join(dataDir, `${ this.modelPrefix }_${ id }.json`);
  }

  async getAllSortedByName() {
    const items = await this.list();
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }

  async delete(id) {
    const itemFilePath = await this.getItemFilePath(id);
    try {
      await fs.access(itemFilePath);
    } catch (error) {
      throw new Error(`${ this.modelPrefix } not found`);
    }

    await fs.unlink(itemFilePath);
    // Remove from cache
    memoryCache.delete(id);
    return true;
  }

  async getDataDir() {
    const dataDir = path.join(process.cwd(), '.aidev', this.modelName);

    // Ensure the directory exists
    try {
      await fs.access(dataDir);
    } catch (error) {
      await fs.mkdir(dataDir, { recursive: true });
    }

    return dataDir;
  }
}

module.exports = StoreBase;
