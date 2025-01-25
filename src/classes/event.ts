import type { GatewayDispatchEvents, GatewayDispatchPayload } from "discord-api-types/gateway/v10";

type _callback<E extends Event, Event extends GatewayDispatchEvents = GatewayDispatchEvents> = (data: Extract<GatewayDispatchPayload, {
  t: E;
}>["d"]) => unknown;

export class Event<E extends Event, Event extends GatewayDispatchEvents = GatewayDispatchEvents> {
  name: E;
  callback: _callback<E>;
  constructor(name: E, callback: _callback<E>) {
    this.name = name;
    this.callback = callback;
  }
}