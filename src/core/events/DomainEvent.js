export default class DomainEvent {
  constructor(name, payload, meta = {}) {
    this.name = name;
    this.payload = payload;
    this.meta = {
      occurredAt: new Date(),
      ...meta,
    };
  }
}
