class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 250;
  }

  get(id) {
    return this.cache.get(id);
  }

  set(id, data) {
    if (this.cache.size >= this.maxSize) {
      // Remove the oldest item (first inserted)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(id, data);
  }

  delete(id) {
    this.cache.delete(id);
  }

  clear() {
    this.cache.clear();
  }
}

module.exports = new MemoryCache();
