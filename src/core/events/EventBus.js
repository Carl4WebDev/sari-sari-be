class EventBus {
  constructor() {
    this.handlers = {};
  }

  subscribe(eventName, handler) {
    if (!this.handlers[eventName]) {
      this.handlers[eventName] = [];
    }
    this.handlers[eventName].push(handler);
  }

  async publish(event) {
    const handlers = this.handlers[event.name] || [];
    for (const handler of handlers) {
      await handler(event);
    }
  }
}

export default new EventBus();
