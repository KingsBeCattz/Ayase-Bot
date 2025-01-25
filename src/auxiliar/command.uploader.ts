import { writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { deepEquals } from 'bun';
import {
	ApplicationCommandType,
	type RESTPostAPIChatInputApplicationCommandsJSONBody
} from 'discord-api-types/v10';
import { Panic } from 'kodkord';
import CONFIG from 'src/ayase.config.json';
import type { CommandLoader } from './command.loader';

export class CommandUploader {
	constructor(
		private COMMANDS: CommandLoader,
		public path: string
	) {}

	private $insert(json: JSONObject) {
		const _ = join(process.cwd(), this.path);
		try {
			writeFileSync(_, JSON.stringify(json, null, 2));
			return true;
		} catch (e) {
			new Panic('Command Uploader > Insert', String(e)).panic();
			return false;
		}
	}

	async upload() {
		const _ = join(process.cwd(), this.path);
		const cache = await readFile(_)
			.then((buffer) => JSON.parse(buffer.toString()))
			.catch(() => ({}));

		for (const command of this.COMMANDS.values()) {
			const app: RESTPostAPIChatInputApplicationCommandsJSONBody = {
				...command.data,
				type: ApplicationCommandType.ChatInput,
				options: []
			};

			if (command.options)
				for (const option of command.options) app.options?.push(option);

			if (deepEquals(cache[command.data.name], app, true)) continue;
			cache[app.name] = app;

			await this.COMMANDS.client.rest.post(
				`/applications/${CONFIG.bot.id}/commands`,
				{
					body: app as unknown as Record<string, object>
				}
			);
		}

		this.$insert(cache);
	}
}
