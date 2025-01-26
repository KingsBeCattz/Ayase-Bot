import { type Client, Dictionary } from 'kodkord';

export class Cache<T, ARGS> extends Dictionary<string, T> {
	constructor(
		private CLIENT: Client,
		private route: (...args: ARGS[]) => string,
		// biome-ignore lint/suspicious/noExplicitAny:
		private before_set: (data: T) => any,
		type = 'GENERIC'
	) {
		super(undefined, undefined, `CACHE > ${type}`);
	}

	public async fetch(...args: ARGS[]) {
		const res = await this.CLIENT.rest.get<T & { id: string }>(
			this.route(...args)
		);
		this.set(res.id, this.before_set(res));
		return res;
	}
}
