const express = require('express');
const projectsController = require('./controllers/projects.controller');
const conversationsController = require("./controllers/conversations.controller");
const messagesController = require("./controllers/messages.controller");
const tasksController = require("./controllers/tasks.controller");
const referencesController = require("./controllers/references.controller");
const assistantsController = require("./controllers/assistants.controller");
const settingsController = require("./controllers/settings.controller");

class Router {
  constructor() {
    this.expressRouter = express.Router();

    // Health check endpoint
    this.expressRouter.get('/health-check', (req, res) => {
      res.json({ status: 'ok', version: '1.0.0 alpha' });
    });

    // Register all controller endpoints
    projectsController.registerEndpoints(this.expressRouter);
    conversationsController.registerEndpoints(this.expressRouter);
    messagesController.registerEndpoints(this.expressRouter);
    tasksController.registerEndpoints(this.expressRouter);
    referencesController.registerEndpoints(this.expressRouter);
    assistantsController.registerEndpoints(this.expressRouter);
    settingsController.registerEndpoints(this.expressRouter);
  }

  getRouter() {
    return this.expressRouter;
  }
}

module.exports = new Router();
