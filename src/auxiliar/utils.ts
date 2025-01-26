import type {
	GatewayActivityUpdateData,
	GatewayPresenceUpdateData
} from 'discord-api-types/v10';
import type { Client } from 'kodkord';
import type WS from 'ws';

String.prototype.capitalize = function (): string {
	if (this.length === 0) return this as string;
	return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.reverse = function (): string {
	if (this.length === 0) return this as string;
	return this.split('').reverse().join('');
};

String.prototype.fill = function (keywords) {
	return this.replace(/{(\w+)}/g, (_, key) =>
		String(keywords[key] ?? `{${key}}`)
	);
};

Number.prototype.format = function (separator: '.' | ',' = ','): string {
	return String(this).replace(/\B(?=(\d{3})+(?!\d))/g, separator);
};

BigInt.prototype.format = function (separator: '.' | ',' = ','): string {
	return Number(this).format(separator);
};

Array.prototype.format = function (separators): string {
	if (this.length <= 0) return this[0] ?? '';
	const last = this.pop();
	return `${this.join(`${separators?.comma ?? ','} `)} ${separators?.and ?? '&'} ${last}`;
};

export class Utils {
	constructor(public CLIENT: Client) {}

	setStatus(status: GatewayActivityUpdateData) {
		for (const shard of this.CLIENT.shards.values()) {
			(
				shard.websocket as unknown as Omit<WebSocket, 'ws'> & {
					ws: WS;
				}
			).ws.send(
				JSON.stringify({
					op: 3,
					d: {
						since: null,
						activities: [status],
						status: 'online',
						afk: false
					} as GatewayPresenceUpdateData
				})
			);
		}
	}

	get random() {
		return {
			number(max: number, min = 0, decimals = 0): number {
				if (!max) return 0;
				if (
					max === 0 ||
					max === min ||
					typeof max !== 'number' ||
					typeof min !== 'number'
				)
					return 0;
				const random = Math.random() * (max - min) + min;
				return Number(random.toFixed(decimals));
			},
			on_array<T>(array: T[], length = 1): T[] {
				if (!Array.isArray(array)) return [];
				const len = typeof length !== 'number' ? 1 : length;
				const arr: T[] = [];
				if (array.length < len) return array;
				let j = 0;
				do {
					const random = Math.floor(Math.random() * array.length);
					if (arr.includes(array[random]) === true) continue;
					arr.push(array[random]);
					j++;
				} while (j < len);
				return arr;
			}
		};
	}
}
