import { inspect } from 'node:util';
import { Transpiler } from 'bun';
import { create } from 'sourcebin';

import {
	type APIApplicationCommandInteractionDataStringOption,
	type APIMessageActionRowComponent,
	ApplicationCommandOptionType
} from 'discord-api-types/v10';
import { Panic } from 'kodkord';
import { CONSTANTS, EMOJIS, LOGOS } from 'src/auxiliar/constants';
import { Command, CommandCategory, CommandType } from 'src/classes/command';

const transpiler = new Transpiler({
	loader: 'ts'
});

export default new Command({
	data: {
		name: 'eval',
		description: 'Eval a typescript code'
	},
	settings: {
		type: CommandType.GLOBAL,
		developer: true,
		experimental: false,
		cooldown: 0,
		category: CommandCategory.DEVELOPER
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'code',
			description: 'Code to evaluate!',
			required: true
		}
	],
	async code(ctx) {
		const message = await ctx.write({
			content: '# Evaluating...'
		});
		const _time = Date.now();

		const code =
			(
				ctx.get(
					'code',
					ApplicationCommandOptionType.String
				) as APIApplicationCommandInteractionDataStringOption | null
			)?.value ?? ctx.ARGS.join(' ');

		let output: string;
		// biome-ignore lint/security/noGlobalEval: The use is protected by bot permissions
		let _ = await eval(await transpiler.transform(code));
		let type = 'unknown';

		try {
			type = Array.isArray(_) ? 'array' : typeof _;

			if (type === 'function') _ = _.toString();
			else
				_ = inspect(_, {
					depth: 0,
					showHidden: true
				});

			output = `\`\`\`ts\n${_}\n\`\`\``
				.replaceAll(process.env.TOKEN as string, '[TOKEN]')
				.replaceAll('    ', '  ');
		} catch (err) {
			const message =
				err instanceof Error ? (err.stack ?? String(err)) : String(err);

			new Panic('Eval > Error', message).panic();

			output = `\`\`\`sh\n${message}\n\`\`\``;
			_ = message;
			type = 'error';
		}

		const time = Date.now() - _time;

		const buttons: APIMessageActionRowComponent[] = [
			{
				type: 2,
				style: 4,
				label: 'Delete',
				custom_id: `${CONSTANTS.DELETE_EVAL}.${ctx.AUTHOR.raw.id}`,
				emoji: {
					id: EMOJIS.TRASH
				}
			},
			{
				type: 2,
				style: 2,
				label: `${time}ms`,
				custom_id: 'time',
				disabled: true,
				emoji: {
					id: EMOJIS.CLOCK
				}
			},
			{
				type: 2,
				style: type === 'error' ? 4 : 2,
				label: type.capitalize(),
				custom_id: 'type',
				disabled: true,
				emoji: {
					id: EMOJIS.MAGNIFIER
				}
			}
		];

		if (output.length > 2000) {
			const bin = await create({
				files: [
					{
						content: `/**\n * Type: ${type.capitalize()}\n * Time: ${time}ms\n*/\n\n${_}`,
						language: 'typescript'
					}
				]
			});

			output = `\`\`\`\n${bin.shortUrl}\n\`\`\``;
			buttons.splice(1, 0, {
				type: 2,
				style: 5,
				label: 'SourceBin',
				url: bin.shortUrl,
				emoji: {
					id: LOGOS.SOURCEBIN
				}
			});
		}

		return ctx.edit(
			{
				content: output,
				components: [
					{
						type: 1,
						components: buttons
					}
				]
			},
			message
		);
	}
});
