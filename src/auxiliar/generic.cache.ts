import { type Client, Dictionary } from 'kodkord';

export class Cache<T> extends Dictionary<string, T> {
	constructor(
		private CLIENT: Client,
		private route: string,
		type = 'GENERIC'
	) {
		super(undefined, undefined, `CACHE > ${type}`);
	}

	public async fetch(id: string) {
		const res = await this.CLIENT.rest.get<T & { id: string }>(
			this.route.replace('{id}', id)
		);
		this.set(res.id, res);
		return res;
	}
}
