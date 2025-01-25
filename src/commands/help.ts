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
		ctx.write({
			embeds: [
				{
					title: '¡Bienvenido al Comando de Ayuda!',
					description: `Aquí encontrarás todo lo necesario para entender y usar mis comandos de forma sencilla. ¡Estoy aquí para ayudarte! Actualmente, tengo ${ctx.COMMANDS.size} comandos organizados en ${COMMANDS_CATEGORIES.length} categorías.`,
					color: ctx.UTILS.random.number(16777215)
				}
			]
		});
	}
});
