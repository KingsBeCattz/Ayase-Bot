import { Command, CommandType } from 'src/classes/command';

export default new Command({
	data: {
		name: 'ping',
		description: 'See my ping!'
	},
	settings: {
		type: CommandType.GLOBAL,
		developer: false,
		experimental: false,
		cooldown: 0
	},
	async code(ctx) {
		const MSG_TIMESTAMP = Number((BigInt(ctx.DATA.id) >> 22n) + 1420070400000n);
		const message = await ctx.write({
			content: '# CALCULATING...'
		});
		const RESPONSE_TIMESTAMP = Number(
			(BigInt(message.id) >> 22n) + 1420070400000n
		);
		ctx.edit(
			{
				content: `Hiiii!! my pings  are:\n- **API**: \`${await ctx.CLIENT.rest.latency()}ms\`\n- **RESPONSE**: \`${RESPONSE_TIMESTAMP - MSG_TIMESTAMP}ms\`\n- **EDITING**: \`${Date.now() - RESPONSE_TIMESTAMP}ms\``
			},
			message
		);
	}
});
