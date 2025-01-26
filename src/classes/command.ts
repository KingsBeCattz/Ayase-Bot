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
		if (!ctx.CACHE.COOLDOWNS.isExpired(ctx.AUTHOR.raw.id, this.data.name)) {
			const data = ctx.CACHE.COOLDOWNS.getForUser(
				ctx.AUTHOR.raw.id,
				this.data.name
			)!;
			if (data.knows) return false;
			ctx.write({
				content: `Hey, you're going too fast! You'll be able to use this <t:${((data.timestamp + data.time) / 1000).toFixed()}:R>, so just wait a little while, okay?`
			});
			data.knows = true;
			ctx.CACHE.COOLDOWNS.setForUser(data);
			return false;
		}

		if (
			this.settings.developer &&
			!_developers_list.includes(ctx.AUTHOR.raw.id)
		) {
			ctx.write({
				content:
					"I'm sorry, but this is for my developers only! I don't want anyone else sticking their hand in where it doesn't belong, understood?"
			});
			return false;
		}

		if (this.settings.cooldown)
			ctx.CACHE.COOLDOWNS.setForUser({
				user_id: ctx.AUTHOR.raw.id,
				command: this.data.name,
				timestamp: Date.now(),
				time: this.settings.cooldown,
				knows: false
			});

		switch (this.settings.type) {
			case CommandType.DM: {
				if ((await ctx.DATA.channel())!.raw.type !== ChannelType.DM) {
					ctx.write({
						content:
							'Oops, sorry! This command is exclusively for use in my direct messages, okay? So come over here and do it right.'
					});
					return false;
				}
				break;
			}
			case CommandType.GUILD: {
				if ((await ctx.DATA.channel())!.raw.type === ChannelType.DM) {
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
