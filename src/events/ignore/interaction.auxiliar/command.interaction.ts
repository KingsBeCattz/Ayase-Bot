import { CLIENT, COMMANDS } from '@/';
import type { Interaction } from '@kodkord/classes';
import type { InteractionType } from 'discord-api-types/v10';
import { Context } from 'src/classes/context';

export async function InteractionCommandAuxiliar(
	i: Interaction<InteractionType>
) {
	if (!i.isApplicationCommand()) return;
	const ctx = await new Context(CLIENT, i, COMMANDS).cache();
	ctx.COMMAND!.code(ctx);
}
