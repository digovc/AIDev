const path = require("path");
const fs = require("fs").promises;

class SettingsStore {
  settingsFilePath = path.resolve('.aidev/settings.json');

  async getSettings() {
    try {
      await this._ensureDirectoryExists();
      return JSON.parse(await fs.readFile(this.settingsFilePath, 'utf8'));
    } catch (error) {
      return {};
    }
  }

  async saveSettings(settings) {
    await this._ensureDirectoryExists();
    await fs.writeFile(this.settingsFilePath, JSON.stringify(settings, null, 2), 'utf8');
  }

  async _ensureDirectoryExists() {
    await fs.mkdir(path.dirname(this.settingsFilePath), { recursive: true });
  }
}

module.exports = new SettingsStore();
