import type { Database } from 'bun:sqlite';
import { Interaction, Message, User } from '@kodkord/classes';
import {
	type APIApplicationCommandInteraction,
	type APIChatInputApplicationCommandInteractionData,
	type APIInteractionResponse,
	type APIMessage,
	ApplicationCommandOptionType,
	type InteractionType,
	MessageFlags,
	type MessageType,
	type RESTPatchAPIChannelMessageJSONBody,
	type RESTPostAPIChannelMessageJSONBody,
	Routes
} from 'discord-api-types/v10';
import { type Client, Note } from 'kodkord';
import type { CommandLoader } from 'src/auxiliar/command.loader';
import type { Utils } from 'src/auxiliar/utils';
import CONFIG from 'src/ayase.config.json';
import { CACHE, DATABASE, UTILS } from '..';
import type { Command } from './command';

export class Context {
	CLIENT: Client;
	DATA: Message<MessageType> | Interaction<InteractionType>;
	AUTHOR: User;
	CONFIG: typeof CONFIG;
	DATABASE: Database;

	ARGS: string[];
	PREFIX: string;

	COMMANDS: CommandLoader;
	COMMAND?: Command;

	CACHE: typeof CACHE;
	UTILS: Utils;

	constructor(
		CLIENT: Client,
		DATA: Message<MessageType> | Interaction<InteractionType>,
		COMMANDS: CommandLoader
	) {
		const _PREFIX =
			this.prefixes.find((p) =>
				DATA instanceof Message
					? (DATA.raw as APIMessage).content?.toLowerCase().startsWith(p)
					: CONFIG.prefix
			) ?? CONFIG.prefix;
		const _ARGS =
			DATA instanceof Message
				? ((DATA.raw as APIMessage).content
						.slice(_PREFIX.length)
						.trim()
						.split(/ +/) ?? [])
				: [];
		const _FIRST_ARG =
			DATA instanceof Message
				? _ARGS.shift()?.toLowerCase()
				: (DATA.raw as APIApplicationCommandInteraction).data.name;

		this.CLIENT = CLIENT;
		this.DATA = DATA;
		this.AUTHOR =
			this.DATA instanceof Message
				? this.DATA.author()
				: new User(
						//@ts-expect-error
						CLIENT.rest,
						(this.DATA.raw as APIApplicationCommandInteraction).user ??
							(this.DATA.raw as APIApplicationCommandInteraction).member?.user!
					);
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
		const channel = (await this.DATA.channel())!;

		if (!this.CACHE.USERS.has(CONFIG.bot.id))
			await this.CACHE.USERS.fetch(CONFIG.bot.id);
		if (!this.CACHE.USERS.has(this.AUTHOR.raw.id))
			this.CACHE.USERS.set(this.AUTHOR.raw.id, this.AUTHOR);
		if (!this.CACHE.CHANNELS.has(channel.raw.id))
			await this.CACHE.CHANNELS.set(channel.raw.id, channel);

		return this;
	}

	get client_user() {
		return this.CACHE.USERS.get(CONFIG.bot.id);
	}

	get guild() {
		return null; //this.CACHE.GUILDS.get(this.DATA.guild_id ?? '');
	}

	get prefixes() {
		return [`<@${CONFIG.bot.id}>`, `<@!${CONFIG.bot.id}>`, CONFIG.prefix];
	}

	public async write(
		data: RESTPostAPIChannelMessageJSONBody | APIInteractionResponse
		//@ts-expect-error
	): Promise<Message<MessageType>> {
		if (this.DATA instanceof Interaction && this.DATA.isApplicationCommand()) {
			await this.DATA.defer(MessageFlags.Loading);
			await this.DATA.respond(data as APIInteractionResponse);
			return new Message(
				//@ts-expect-error
				this.CLIENT.rest,
				await this.CLIENT.rest.get<APIMessage>(
					Routes.webhookMessage(this.CONFIG.bot.id, this.DATA.raw.token, '@original')
				)
			);
		}
		if (this.DATA instanceof Message && this.DATA.isDefault()) {
			return (await (await this.DATA.channel())!.postMessage(
				data as RESTPostAPIChannelMessageJSONBody
			))!;
		}
	}

	public async edit(data: APIInteractionResponse): Promise<Message<MessageType>>;
	public async edit(
		data: RESTPatchAPIChannelMessageJSONBody,
		msg: Message<MessageType>
	): Promise<Message<MessageType>>;
	public async edit(
		data: APIInteractionResponse | RESTPatchAPIChannelMessageJSONBody,
		msg?: Message<MessageType>
	): Promise<Message<MessageType>> {
		if (this.DATA instanceof Interaction && this.DATA.isApplicationCommand()) {
			await this.DATA.editResponse(data as APIInteractionResponse);
			return new Message(
				//@ts-expect-error
				this.CLIENT.rest,
				await this.CLIENT.rest.get<APIMessage>(
					Routes.webhookMessage(this.CONFIG.bot.id, this.DATA.raw.token, '@original')
				)
			);
		}

		return new Message(
			//@ts-expect-error
			this.CLIENT.rest,
			await this.CLIENT.rest.patch<APIMessage>(
				Routes.channelMessage(
					(await msg!.channel())!.raw.id,
					(msg!.raw as APIMessage).id
				),
				{ body: data as Record<string, object> }
			)
		);
	}

	public async delete(msg: Message<MessageType>) {
		return await this.CLIENT.rest
			.delete(
				Routes.channelMessage(
					(await msg!.channel())!.raw.id,
					(msg!.raw as APIMessage).id
				)
			)
			.then((_) => true)
			.catch((e: Error) => {
				new Note('Delete Message', e.message).panic();
				return false;
			});
	}

	public get(name: string, expected: ApplicationCommandOptionType) {
		if (this.DATA instanceof Message || !this.DATA.isApplicationCommand())
			return null;
		return (
			(this.DATA.raw.data as APIChatInputApplicationCommandInteractionData).options
				?.filter((op) => op.type === expected)
				.find((op) => op.name.toLowerCase() === name.toLowerCase()) ?? null
		);
	}

	get subcommandgroup() {
		if (this.DATA instanceof Message || !this.DATA.isApplicationCommand())
			return null;
		return (
			(
				this.DATA.raw.data as APIChatInputApplicationCommandInteractionData
			).options?.find(
				(op) => op.type === ApplicationCommandOptionType.SubcommandGroup
			)?.name ?? null
		);
	}

	get subcommand() {
		if (this.DATA instanceof Message || !this.DATA.isApplicationCommand())
			return null;
		return (
			(
				this.DATA.raw.data as APIChatInputApplicationCommandInteractionData
			).options?.find((op) => op.type === ApplicationCommandOptionType.Subcommand)
				?.name ?? null
		);
	}
}
