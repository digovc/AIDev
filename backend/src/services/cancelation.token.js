class CancelationToken {
  constructor(taskId, cancelCallback) {
    this._cancel = false;
    this.taskId = taskId;
    this.cancelCallback = cancelCallback;
  }

  cancel() {
    if (this._cancel) {
      return;
    }

    this._cancel = true;
    this.cancelCallback();
  }

  isCanceled() {
    if (this._cancel) {
      this.cancelCallback();
    }

    return this._cancel;
  }

  throwIfCanceled() {
    if (this.isCanceled()) {
      throw new Error("Canceled");
    }
  }
}

module.exports = CancelationToken;
