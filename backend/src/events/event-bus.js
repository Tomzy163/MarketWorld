import { EventEmitter } from 'node:events';

export const eventBus = new EventEmitter();

export function publishDomainEvent(type, payload) {
  eventBus.emit(type, {
    type,
    payload,
    occurredAt: new Date().toISOString(),
  });
}
