class ShortcutService {
  _listners = [];

  init() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  on(command, callback, priority = 0) {
    this._listners.push({ command, callback, priority });
  }

  off(command, callback) {
    this._listners = this._listners.filter(l => l.command !== command || l.callback !== callback);
  }

  handleKeyDown(event) {
    if (event.key === 'Escape') {
      this._runCommand('close', event);
    } else if (event.key === 'E' && event.ctrlKey && event.shiftKey) {
      this._runCommand('execute', event);
    } else if (event.key === 'S' && event.ctrlKey && event.shiftKey) {
      this._runCommand('save', event);
    } else if (event.key === 'N' && event.ctrlKey && event.shiftKey) {
      this._runCommand('new', event);
    }
  }

  _runCommand(command, event) {
    const relevantListeners = this._listners.filter(l => l.command === command);

    if (relevantListeners.length === 0) return;

    const maxPriority = Math.max(...relevantListeners.map(l => l.priority));
    const listenersWithMaxPriority = relevantListeners.filter(l => l.priority === maxPriority);

    const lastListener = listenersWithMaxPriority.findLast(l => l.command === command); // findLast ensures the last registered with max priority

    if (lastListener) {
      lastListener.callback(event);
    }
  }
}

export const shortcutService = new ShortcutService();
