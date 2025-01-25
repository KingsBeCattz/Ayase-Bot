import { existsSync, lstatSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Dictionary } from 'kodkord';

export class Loader<T> extends Dictionary<string, T> {
	constructor(public onfinish: (loader: Loader<T>) => void) {
		super();
	}
	private async _load(path: string, fn: (loaded: T, loader: this) => unknown) {
		const global = join(process.cwd(), path);
		if (!existsSync(global)) mkdirSync(global);

		for (const route of readdirSync(global)) {
			if (route.startsWith('ignore')) continue;
			const module = join(global, route);

			if (lstatSync(module).isDirectory()) {
				this._load(join(path, route), fn);
				continue;
			}
			if (!module.endsWith('ts')) continue;
			delete require.cache[require(module).default];
			const loaded: T = require(module).default;

			fn(loaded, this);
		}
	}
	async load(path: string, fn: (loaded: T, loader: this) => unknown) {
		this._load(path, fn);

		this.onfinish(this);
	}
}
