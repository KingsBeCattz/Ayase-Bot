import { CLIENT, COMMANDS } from '@/';
import type { GatewayMessageCreateDispatchData } from 'discord-api-types/gateway/v10';
import { Context } from 'src/classes/context';

export async function CommandAuxiliar(msg: GatewayMessageCreateDispatchData) {
	if (msg.author.bot) return;
	const ctx = await new Context(CLIENT, msg, COMMANDS).cache();
	if (!ctx.COMMAND) return;

	if (!(await ctx.COMMAND.verify(ctx))) return;

	return ctx.COMMAND.code(ctx);
}
