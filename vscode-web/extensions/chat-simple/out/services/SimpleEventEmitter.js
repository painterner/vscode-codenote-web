"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEmitter = void 0;
class EventEmitter {
    // Static property to hold all event listeners
    static listeners = {};
    // Static method to register an event listener
    static on(event, listener) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(listener);
        return listener;
    }
    // Static method to register an event listener
    static onoff(event, listener) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(listener);
        return () => EventEmitter.off(event, listener);
    }
    // Static method to unregister an event listener
    static off(event, listener) {
        if (!this.listeners[event])
            return;
        const index = this.listeners[event].indexOf(listener);
        if (index !== -1) {
            this.listeners[event].splice(index, 1);
        }
        if (this.listeners[event].length === 0) {
            delete this.listeners[event];
        }
    }
    // Static method to dispatch an event
    static dispatch(event, ...args) {
        if (this.listeners[event]) {
            this.listeners[event].forEach((listener) => listener(...args));
        }
    }
}
exports.EventEmitter = EventEmitter;
//# sourceMappingURL=SimpleEventEmitter.js.map