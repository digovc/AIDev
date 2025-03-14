const settingsStore = require('../stores/settings.store');

class SettingsController {
  registerEndpoints(router) {
    router.get('/settings', async (req, res) => {
      try {
        const settings = await settingsStore.getSettings();
        res.json(settings);
      } catch (error) {
        res.status(500).json({ error: 'Falha ao obter configurações' });
      }
    });

    router.post('/settings', async (req, res) => {
      try {
        await settingsStore.saveSettings(req.body);
        res.status(200).json({ success: true });
      } catch (error) {
        res.status(500).json({ error: 'Falha ao salvar configurações' });
      }
    });
  }
}

module.exports = new SettingsController();
