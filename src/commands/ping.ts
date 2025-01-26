import { Command, CommandCategory, CommandType } from 'src/classes/command';

export default new Command({
	data: {
		name: 'ping',
		description: 'See my ping!'
	},
	settings: {
		type: CommandType.GLOBAL,
		developer: false,
		experimental: false,
		cooldown: 5000,
		category: CommandCategory.INFORMATION
	},
	async code(ctx) {
		const MSG_TIMESTAMP = Number(
			//@ts-expect-error
			(BigInt(ctx.DATA.raw.id) >> 22n) + 1420070400000n
		);
		const message = await ctx.write({
			content: '# CALCULATING...'
		});
		const RESPONSE_TIMESTAMP = Number(
			//@ts-expect-error
			(BigInt(message.raw.id) >> 22n) + 1420070400000n
		);
		ctx.edit(
			{
				content: `Hiiii!! my pings  are:\n- **API**: \`${await ctx.CLIENT.rest.latency()}ms\`\n- **RESPONSE**: \`${RESPONSE_TIMESTAMP - MSG_TIMESTAMP}ms\`\n- **EDITING**: \`${Date.now() - RESPONSE_TIMESTAMP}ms\``
			},
			message
		);
	}
});
