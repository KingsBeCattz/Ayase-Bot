import type { APIMessage } from 'discord-api-types/v10';
import { Command, CommandCategory, CommandType } from 'src/classes/command';
import { Context } from 'src/classes/context';

export default new Command({
	data: {
		name: 'simule',
		description: 'Simulates a command using a message'
	},
	settings: {
		type: CommandType.GLOBAL,
		developer: true,
		experimental: true,
		cooldown: 0,
		category: CommandCategory.DEVELOPER
	},
	async code(ctx) {
		if (!ctx.ARGS.length) {
			ctx.write({
				content:
					"In order for you to use that command, I need you to give me these arguments, ok?\n```\n<cmd> - Command to execute\n<msg> - Base message id\n<ch> - Channel id on which the message is on\n```\nSo don't make me repeat myself!"
			});
			return;
		}
		const cmd = ctx.COMMANDS.get(ctx.ARGS.shift() ?? '');
		if (!cmd) {
			ctx.write({
				content:
					"Give me a command that already exists, please! I don't want to see you make one up, eh?"
			});
			return;
		}
		if (!ctx.ARGS[0] || Number.isNaN(Number(ctx.ARGS[0]))) {
			ctx.write({
				content:
					'Hey, you missed the message ID! How do you want me to do magic without that?'
			});
			return;
		}
		if (!ctx.ARGS[1] || Number.isNaN(Number(ctx.ARGS[1]))) {
			ctx.write({
				content:
					'Hey, you missed the channel ID! How do you want me to do magic without that?'
			});
			return;
		}

		const res = await ctx.write({
			content:
				"Okay, now I'm going to simulate the command! Get ready, this is going to be good."
		});

		const MSG = await ctx.CLIENT.rest
			.get<APIMessage>(`/channels/${ctx.ARGS[1]}/messages/${ctx.ARGS[0]}`)
			.catch((_) => null);
		if (!MSG) {
			ctx.edit(
				{
					content:
						"Hey, there's something wrong here. I'm sure you gave me an incorrect, false or non-existent ID. check it out!"
				},
				res
			);
			return;
		}

		ctx.edit(
			{
				content: `> **Author**: <@${MSG.author.id}>\n> **Requested by**: <@${ctx.AUTHOR.id}>\n-# **Keep in mind that this command is designed for debugging only, ok? Use it with care!**`
			},
			res
		);
		cmd.code(
			new Context(
				ctx.CLIENT,
				await ctx.CLIENT.rest.get(
					`/channels/${ctx.ARGS[1]}/messages/${ctx.ARGS[0]}`
				),
				ctx.COMMANDS
			)
		);
	}
});
