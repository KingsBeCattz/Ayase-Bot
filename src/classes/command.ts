import {
	type APIApplicationCommandBasicOption,
	type APIApplicationCommandSubcommandGroupOption,
	type APIApplicationCommandSubcommandOption,
	ChannelType
} from 'discord-api-types/v10';
import CONFIG from 'src/ayase.config.json';
import type { Context } from './context';

export const _developers_list = CONFIG.developers;

export enum CommandType {
	GLOBAL = 0,
	GUILD = 1,
	DM = 2
}

export enum CommandCategory {
	UNKNOWN = 'UNKNOWN',
	INFORMATION = 'INFORMATION',
	UTILITY = 'UTILITY',
	FUN = 'FUN',
	CONFIGURATION = 'CONFIGURATION',
	DEVELOPER = 'DEVELOPER'
}

export class Command {
	data: CommandData;
	settings: CommandSettings;
	options?:
		| APIApplicationCommandSubcommandOption[]
		| APIApplicationCommandSubcommandGroupOption[]
		| APIApplicationCommandBasicOption[];
	code: (ctx: Context) => Promise<unknown>;
	constructor(options: CommandOptions) {
		this.data = options.data;
		this.settings = options.settings;
		this.options = options.options ?? [];
		this.code = options.code;
	}

	async verify(ctx: Context): Promise<boolean> {
		if (this.settings.developer && !_developers_list.includes(ctx.AUTHOR.id)) {
			ctx.write({
				content:
					"I'm sorry, but this is for my developers only! I don't want anyone else sticking their hand in where it doesn't belong, understood?"
			});
			return false;
		}

		switch (this.settings.type) {
			case CommandType.DM: {
				if (ctx.channel.type !== ChannelType.DM) {
					ctx.write({
						content:
							'Oops, sorry! This command is exclusively for use in my direct messages, okay? So come over here and do it right.'
					});
					return false;
				}
				break;
			}
			case CommandType.GUILD: {
				if (ctx.channel.type === ChannelType.DM) {
					ctx.write({
						content:
							"Sorry! This command is exclusively for use on servers, so it doesn't work here."
					});
					return false;
				}
				break;
			}
		}
		return true;
	}
}
