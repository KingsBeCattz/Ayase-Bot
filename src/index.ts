import { Database } from 'bun:sqlite';
import {
	type APIDMChannel,
	type APIGuild,
	type APIGuildChannel,
	type APIUser,
	type ChannelType,
	type GatewayDispatchEvents,
	GatewayIntentBits
} from 'discord-api-types/v10';
import { Client, Note } from 'kodkord';
import { Cache } from 'src/auxiliar/generic.cache';
import { CommandLoader } from './auxiliar/command.loader';
import { Loader } from './auxiliar/generic.loader';
import type { Event } from './classes/event';

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
	USERS: new Cache<APIUser>(CLIENT, '/users/{id}', 'USERS'),
	GUILDS: new Cache<APIGuild>(CLIENT, '/guilds/{id}', 'GUILDS'),
	CHANNELS: new Cache<APIGuildChannel<ChannelType> | APIDMChannel>(
		CLIENT,
		'/channels/{id}',
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
