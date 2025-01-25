import type { Database } from 'bun:sqlite';
import {
	type APIChatInputApplicationCommandInteraction,
	type APIMessage,
	type APIUser,
	ApplicationCommandOptionType,
	type GatewayMessageCreateDispatchData,
	type RESTPatchAPIChannelMessageJSONBody,
	type RESTPostAPIChannelMessageJSONBody,
	type RESTPostAPIInteractionCallbackWithResponseResult
} from 'discord-api-types/v10';
import { type Client, Note } from 'kodkord';
import type { Loader } from 'src/auxiliar/generic.loader';
import type { Utils } from 'src/auxiliar/utils';
import CONFIG from 'src/ayase.config.json';
import { CACHE, DATABASE, UTILS } from '..';
import type { Command } from './command';

export class Context {
	CLIENT: Client;
	DATA:
		| GatewayMessageCreateDispatchData
		| APIChatInputApplicationCommandInteraction;
	AUTHOR: APIUser;
	CONFIG: typeof CONFIG;
	DATABASE: Database;

	ARGS: string[];
	PREFIX: string;

	COMMANDS: Loader<Command>;
	COMMAND?: Command;

	CACHE: typeof CACHE;
	UTILS: Utils;

	constructor(
		CLIENT: Client,
		DATA:
			| GatewayMessageCreateDispatchData
			| APIChatInputApplicationCommandInteraction,
		COMMANDS: Loader<Command>
	) {
		const _PREFIX =
			this.prefixes.find((p) =>
				'content' in DATA
					? DATA.content?.toLowerCase().startsWith(p)
					: CONFIG.prefix
			) ?? CONFIG.prefix;
		const _ARGS =
			'content' in DATA
				? (DATA.content.slice(_PREFIX.length).trim().split(/ +/) ?? [])
				: [];
		const _FIRST_ARG =
			'data' in DATA ? DATA.data.name : _ARGS.shift()?.toLowerCase();

		this.CLIENT = CLIENT;
		this.DATA = DATA;
		this.AUTHOR = 'author' in DATA ? DATA.author : DATA.member?.user!;
		this.CONFIG = CONFIG;
		this.DATABASE = DATABASE;
		this.UTILS = UTILS;

		this.COMMANDS = COMMANDS;
		this.COMMAND = COMMANDS.find(
			(cmd) =>
				_FIRST_ARG?.includes(cmd.data.name) ||
				Object.values(cmd.data.name_localizations ?? {}).includes(_FIRST_ARG ?? '')
		);

		this.CACHE = CACHE;

		this.ARGS = _ARGS ?? [];
		this.PREFIX = _PREFIX;
	}

	async cache() {
		const channel_id =
			'channel' in this.DATA ? this.DATA.channel.id : this.DATA.channel_id;

		if (!this.CACHE.USERS.has(CONFIG.bot.id))
			await this.CACHE.USERS.fetch(CONFIG.bot.id);
		if (!this.CACHE.USERS.has(this.AUTHOR.id))
			this.CACHE.USERS.set(this.AUTHOR.id, this.AUTHOR);
		if (!this.CACHE.CHANNELS.has(channel_id))
			await this.CACHE.CHANNELS.fetch(channel_id);
		if (this.DATA.guild_id && !this.CACHE.GUILDS.has(this.DATA.guild_id))
			await this.CACHE.GUILDS.fetch(this.DATA.guild_id);

		return this;
	}

	get client_user() {
		return this.CACHE.USERS.get(CONFIG.bot.id);
	}

	get guild() {
		return this.CACHE.GUILDS.get(this.DATA.guild_id ?? '');
	}

	get channel() {
		const channel_id =
			'channel' in this.DATA ? this.DATA.channel.id : this.DATA.channel_id;
		if (!this.CACHE.CHANNELS.get(channel_id))
			this.CACHE.CHANNELS.fetch(channel_id);
		return this.CACHE.CHANNELS.get(channel_id)!;
	}

	get prefixes() {
		return [`<@${CONFIG.bot.id}>`, `<@!${CONFIG.bot.id}>`, CONFIG.prefix];
	}

	public async write(
		data: RESTPostAPIChannelMessageJSONBody,
		channel_id = 'channel' in this.DATA
			? this.DATA.channel.id
			: this.DATA.channel_id
	): Promise<APIMessage> {
		if ('token' in this.DATA) {
			return (
				await this.CLIENT.rest.post<RESTPostAPIInteractionCallbackWithResponseResult>(
					`/interactions/${this.DATA.id}/${this.DATA.token}/callback?with_response=true`,
					{
						body: {
							type: 4,
							data: data
						} as unknown as Record<string, object>
					}
				)
			).resource?.message!;
		}

		return await this.CLIENT.rest.post(`/channels/${channel_id}/messages`, {
			body: data as Record<string, object>
		});
	}

	public async edit(data: RESTPatchAPIChannelMessageJSONBody, msg: APIMessage) {
		return await this.CLIENT.rest.patch(
			`/channels/${msg.channel_id}/messages/${msg.id}`,
			{
				body: data as Record<string, object>
			}
		);
	}

	public async delete(msg: APIMessage) {
		return await this.CLIENT.rest
			.delete(`/channels/${msg.channel_id}/messages/${msg.id}`)
			.then((_) => true)
			.catch((e: Error) => {
				new Note('Delete Message', e.message).panic();
				return false;
			});
	}

	public get(name: string, expected: ApplicationCommandOptionType) {
		if (!('token' in this.DATA)) return null;
		return (
			this.DATA.data.options
				?.filter((op) => op.type === expected)
				.find((op) => op.name.toLowerCase() === name.toLowerCase()) ?? null
		);
	}

	get subcommandgroup() {
		if (!('token' in this.DATA)) return null;
		return (
			this.DATA.data.options?.find(
				(op) => op.type === ApplicationCommandOptionType.SubcommandGroup
			)?.name ?? null
		);
	}

	get subcommand() {
		if (!('token' in this.DATA)) return null;
		return (
			this.DATA.data.options?.find(
				(op) => op.type === ApplicationCommandOptionType.Subcommand
			)?.name ?? null
		);
	}
}
