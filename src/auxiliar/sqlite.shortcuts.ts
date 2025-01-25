import type { Database } from 'bun:sqlite';

export class CooldownSnippets {
	constructor(public db: Database) {}

	get(id: string) {}
}
