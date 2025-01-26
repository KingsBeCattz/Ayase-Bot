import { User } from '@kodkord/classes';
import { ComponentType } from 'discord-api-types/v10';
import { CONSTANTS } from 'src/auxiliar/constants';
import { Command, CommandCategory, CommandType } from 'src/classes/command';

const COMMANDS_CATEGORIES = Object.keys(CommandCategory)
	.slice(1)
	.map(($) => $.toLowerCase().capitalize());

export default new Command({
	data: {
		name: 'help',
		description: 'Get help about me!',
		name_localizations: {
			'es-419': 'ayuda'
		}
	},
	settings: {
		cooldown: 10000,
		developer: false,
		experimental: false,
		type: CommandType.GLOBAL,
		category: CommandCategory.UNKNOWN
	},
	async code(ctx) {
		//@ts-expect-error
		const CLIENT_USER = new User(ctx.CLIENT.rest, ctx.client_user!);

		ctx.write({
			embeds: [
				{
					title: '¡Bienvenido al Comando de Ayuda!',
					description: `Aquí encontrarás todo lo necesario para entender y usar mis comandos de forma sencilla. ¡Estoy aquí para ayudarte! Actualmente, tengo ${ctx.COMMANDS.size} comandos organizados en ${COMMANDS_CATEGORIES.length} categorías.`,
					color: 15255263,
					thumbnail: {
						url: CLIENT_USER.avatar().url({ size: 1024 })!
					},
					timestamp: new Date().toISOString(),
					footer: {
						text: ctx.client_user!.raw.username,
						icon_url: ctx.client_user!.avatar().url()!
					}
				}
			],
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.StringSelect,
							custom_id: `${CONSTANTS.HELP_SELECT_MENU}.${ctx.AUTHOR.raw.id}`,
							options: COMMANDS_CATEGORIES.map((c) => ({
								value: c.toLowerCase(),
								label: c
							}))
						}
					]
				}
			]
		});
	}
});
