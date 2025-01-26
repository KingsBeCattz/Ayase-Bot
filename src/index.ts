import { Database } from 'bun:sqlite';
import {
	type APIGuild,
	type ChannelType,
	type GatewayDispatchEvents,
	GatewayIntentBits,
	Routes,
	type Snowflake
} from 'discord-api-types/v10';
import { Client, Note } from 'kodkord';
import { Cache } from 'src/auxiliar/generic.cache';
import { CommandLoader } from './auxiliar/command.loader';
import { Loader } from './auxiliar/generic.loader';
import type { Event } from './classes/event';

import { Channel, User } from '@kodkord/classes';
import { CooldownCache } from './auxiliar/cooldown.cache';
import { Utils } from './auxiliar/utils';

export const CLIENT = new Client({
	intents:
		GatewayIntentBits.Guilds |
		GatewayIntentBits.GuildMessages |
		GatewayIntentBits.MessageContent |
		GatewayIntentBits.DirectMessages,
	token: process.env.TOKEN
});

export const UTILS = new Utils(CLIENT);

export const DATABASE = new Database('src/database.sqlite', { strict: false });
/*
DATABASE.exec(`
  CREATE TABLE IF NOT EXISTS cooldowns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    command TEXT NOT NULL UNIQUE,
    timestamp INTEGER NOT NULL UNIQUE,
    time INTEGER NOT NULL UNIQUE
  );
`);
*/

export const CACHE = {
	USERS: new Cache<User, Snowflake | '@me'>(
		CLIENT,
		Routes.user,
		//@ts-expect-error
		(user) => new User(CLIENT.rest, user),
		'USERS'
	),
	GUILDS: new Cache<APIGuild, Snowflake>(
		CLIENT,
		Routes.guild,
		(_) => _,
		'GUILDS'
	),
	CHANNELS: new Cache<Channel<ChannelType>, Snowflake>(
		CLIENT,
		Routes.channel,
		//@ts-expect-error
		(data) => new Channel(CLIENT.rest, data),
		'CHANNELS'
	),
	COOLDOWNS: new CooldownCache()
};

new Loader<Event<GatewayDispatchEvents>>((loader) =>
	new Note(
		'Event Loader',
		`Loaded Events: ${Array.from(loader.keys()).join(' ')}`
	).note()
).load('src/events', (e, dic) => {
	if (e) {
		CLIENT.events.set(e.name, e.callback);
		dic.set(e.name, e);
	}
});

export const COMMANDS = new CommandLoader(
	CLIENT,
	'src/commands/cache.json',
	(loader) =>
		new Note(
			'Command Loader',
			`Loaded Commands: ${Array.from(loader.keys()).join(' ').toUpperCase()}`
		).note()
);

COMMANDS.load('src/commands', (cmd, dic) => {
	if (!cmd) return;
	dic.set(cmd.data.name, cmd);
});

CLIENT.shards.create(0);
CLIENT.connect();
