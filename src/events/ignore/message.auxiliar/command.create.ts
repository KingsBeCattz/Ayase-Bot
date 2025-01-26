import { CLIENT, COMMANDS } from '@/';
import type { Message } from '@kodkord/classes';
import type { MessageType } from 'discord-api-types/v10';
import { Context } from 'src/classes/context';

export async function CommandAuxiliar(msg: Message<MessageType.Default>) {
	if (msg.author().raw.bot) return;
	const ctx = await new Context(CLIENT, msg, COMMANDS).cache();
	if (!ctx.COMMAND) return;

	if (!(await ctx.COMMAND.verify(ctx))) return;

	return ctx.COMMAND.code(ctx);
}
