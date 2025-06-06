const express = require('express');
const assistantsController = require("./controllers/assistants.controller");
const conversationsController = require("./controllers/conversations.controller");
const filesController = require("./controllers/files.controller");
const gitController = require("./controllers/git.controller");
const messagesController = require("./controllers/messages.controller");
const projectsController = require('./controllers/projects.controller');
const referencesController = require("./controllers/references.controller");
const settingsController = require("./controllers/settings.controller");
const tasksController = require("./controllers/tasks.controller");
const authController = require('./controllers/auth.controller');
const authMiddleware = require('./middlewares/auth.middleware');

class Router {
  constructor() {
    this.expressRouter = express.Router();

    // Health check endpoint
    this.expressRouter.get('/health-check', (req, res) => {
      res.json({ status: 'ok', version: '1.0.0 alpha' });
    });

    // Register all controller endpoints
    authController.registerEndpoints(this.expressRouter);
    assistantsController.registerEndpoints(this.expressRouter);
    conversationsController.registerEndpoints(this.expressRouter);
    filesController.registerEndpoints(this.expressRouter);
    gitController.registerEndpoints(this.expressRouter);
    messagesController.registerEndpoints(this.expressRouter);
    projectsController.registerEndpoints(this.expressRouter);
    referencesController.registerEndpoints(this.expressRouter);
    settingsController.registerEndpoints(this.expressRouter);
    tasksController.registerEndpoints(this.expressRouter);

    // Add middleware protection
    this.expressRouter.use((req, res, next) => {
      const publicRoutes = ['/health-check', '/login'];
      if (publicRoutes.includes(req.path)) return next();
      authMiddleware.handler()(req, res, next);
    });
  }

  getRouter() {
    return this.expressRouter;
  }
}

module.exports = new Router();
