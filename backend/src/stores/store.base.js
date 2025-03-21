const fs = require('fs').promises;
const path = require('path');
const socketIOService = require("../services/socket-io.service");

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

    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    socketIOService.io.emit(`${ this.modelPrefix }-created`, data);

    return data;
  }

  async update(id, data) {
    const itemFilePath = await this.getItemFilePath(id);

    try {
      await fs.access(itemFilePath);
    } catch (error) {
      throw new Error(`${ this.modelPrefix } not found`);
    }

    const existingContent = await fs.readFile(itemFilePath, 'utf8');
    const existingItem = JSON.parse(existingContent);

    // Update item data
    const updatedItem = {
      ...existingItem,
      ...data,
      updatedAt: new Date().toISOString()
    };

    // Ensure ID doesn't change
    updatedItem.id = id;

    // Prepare data before saving
    await this.prepareBeforeSave(updatedItem);

    await fs.writeFile(itemFilePath, JSON.stringify(updatedItem, null, 2));

    socketIOService.io.emit(`${ this.modelPrefix }-updated`, updatedItem);

    return updatedItem;
  }

  async prepareBeforeSave(data) {
    return data;
  }

  async getById(id) {
    const filePath = await this.getItemFilePath(id);
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content);
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
        const filePath = path.join(dataDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const item = JSON.parse(content);
        items.push(item);
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
