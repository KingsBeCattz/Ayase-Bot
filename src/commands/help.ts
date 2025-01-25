import { Command, CommandType } from 'src/classes/command';

export default new Command({
	data: {
		name: 'help',
		description: 'Get help about me!',
		name_localizations: {
			'es-419': 'ayuda'
		}
	},
	settings: {
		cooldown: 1000,
		developer: false,
		experimental: false,
		type: CommandType.GLOBAL
	},
	async code(ctx) {
		ctx.write({
			content: 'Fuck you stupid'
		});
	}
});
