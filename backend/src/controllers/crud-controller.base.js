class CrudControllerBase {
  constructor(modelName, modelPrefix, store) {
    this.modelName = modelName;
    this.modelPrefix = modelPrefix;
    this.store = store;
  }

  registerEndpoints(router) {
    // Manter os endpoints como estão
    router.post(`/${ this.modelName }`, (req, res) => {
      this.create(req, res).catch((e) => this.errorHandler(e, res));
    });

    router.put(`/${ this.modelName }/:id`, (req, res) => {
      this.update(req, res).catch((e) => this.errorHandler(e, res));
    });

    router.delete(`/${ this.modelName }/:id`, (req, res) => {
      this.delete(req, res).catch((e) => this.errorHandler(e, res));
    });

    router.get(`/${ this.modelName }`, (req, res) => {
      this.list(req, res).catch((e) => this.errorHandler(e, res));
    });

    router.get(`/${ this.modelName }/:id`, (req, res) => {
      this.get(req, res).catch((e) => this.errorHandler(e, res));
    });
  }

  errorHandler(err, res) {
    console.log(err);
    res.status(500).send({ error: err.message });
  }

  async create(req, res) {
    const data = req.body;
    const createdItem = await this.store.create(data);
    res.status(201).json(createdItem);
  }

  async update(req, res) {
    const id = req.params.id;
    try {
      const updatedItem = await this.store.update(id, req.body);
      res.json(updatedItem);
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: `${ this.modelPrefix } not found` });
      }
      throw error;
    }
  }

  async list(req, res) {
    const items = await this.store.list();
    res.json(items);
  }

  async get(req, res) {
    const id = req.params.id;
    const item = await this.store.getById(id);

    if (!item) {
      return res.status(404).json({ error: `${ this.modelPrefix } not found` });
    }

    res.json(item);
  }

  async delete(req, res) {
    const id = req.params.id;
    try {
      await this.store.delete(id);
      res.status(204).send();
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: `${ this.modelPrefix } not found` });
      }
      throw error;
    }
  }
}

module.exports = CrudControllerBase;
