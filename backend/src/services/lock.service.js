class LockService {
  constructor() {
    this.lockedIds = new Set();
    this.waitingQueue = {};
  }

  async acquire(resourceId) {
    while (this.lockedIds.has(resourceId)) {
      await new Promise(resolve => {
        if (!this.waitingQueue[resourceId]) {
          this.waitingQueue[resourceId] = [];
        }
        this.waitingQueue[resourceId].push(resolve);
      });
    }
    this.lockedIds.add(resourceId);
  }

  release(resourceId) {
    this.lockedIds.delete(resourceId);
    
    if (this.waitingQueue[resourceId] && this.waitingQueue[resourceId].length > 0) {
      const nextInLine = this.waitingQueue[resourceId].shift();
      if (nextInLine) {
        nextInLine();
      }
    }
  }
}

const lockServiceInstance = new LockService();
module.exports = lockServiceInstance;