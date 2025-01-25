import { CLIENT, COMMANDS } from '@/';
import {
	type APIChatInputApplicationCommandInteraction,
	InteractionType
} from 'discord-api-types/v10';
import { Context } from 'src/classes/context';

export async function InteractionCommandAuxiliar(
	i: APIChatInputApplicationCommandInteraction
) {
	if (i.type !== InteractionType.ApplicationCommand) return;
	const ctx = await new Context(CLIENT, i, COMMANDS).cache();
	ctx.COMMAND!.code(ctx);
}
