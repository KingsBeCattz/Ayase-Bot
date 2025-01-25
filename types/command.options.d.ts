import {
	type APIApplicationCommandBasicOption,
	type APIApplicationCommandOptionBase,
	type APIApplicationCommandSubcommandGroupOption,
	type APIApplicationCommandSubcommandOption,
	type ApplicationCommandOptionType,
	ChannelType,
	type Locale
} from 'discord-api-types/v10';
import { _developers_list } from 'src/classes/command';
import type { Context } from 'src/classes/context';

declare global {
	type LocalizateMap = Partial<Record<Locale, string | null>>;
	interface CommandData {
		name: string;
		description: string;
		name_localizations?: LocalizateMap;
		description_localizations?: LocalizateMap;
	}

	interface CommandSettings {
		type: CommandType;
		developer: boolean;
		experimental: boolean;
		/**
		 * Cooldown in ms
		 */
		cooldown: number;
	}
	interface CommandOptions {
		data: CommandData;
		settings: CommandSettings;
		options?:
			| APIApplicationCommandSubcommandOption[]
			| APIApplicationCommandSubcommandGroupOption[]
			| APIApplicationCommandBasicOption[];
		code: (ctx: Context) => Promise<unknown>;
	}
}
