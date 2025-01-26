import { CLIENT } from '@/';
import type { Interaction } from '@kodkord/classes';
import {
	ComponentType,
	InteractionResponseType,
	type InteractionType,
	MessageFlags,
	Routes
} from 'discord-api-types/v10';
import { CONSTANTS, ERROR_MESSAGES } from 'src/auxiliar/constants';
import CONFIG from 'src/ayase.config.json';

export async function ButtonAuxiliar(i: Interaction<InteractionType>) {
	if (
		!i.isMessageComponent() ||
		i.raw.data.component_type !== ComponentType.Button
	)
		return;

	const userid = i.raw.user?.id ?? i.raw.member?.user.id;
	const id_args = i.raw.data.custom_id.split('.');
	switch (true) {
		case i.raw.data.custom_id.startsWith(CONSTANTS.DELETE_EVAL): {
			if (id_args.pop() !== userid) {
				//await i.defer(MessageFlags.Loading | MessageFlags.Ephemeral);
				await i.respond({
					type: InteractionResponseType.ChannelMessageWithSource,
					data: {
						content: ERROR_MESSAGES.NOT_FOR_U,
						flags: MessageFlags.Ephemeral
					}
				});
				return;
			}

			await CLIENT.rest.post(Routes.interactionCallback(i.raw.id, i.raw.token), {
				body: {
					type: 6
				}
			});
			CLIENT.rest.patch(
				Routes.webhookMessage(CONFIG.bot.id, i.raw.token, i.raw.message.id),
				{
					body: {
						content: '```\nDELETED EVAL\n```',
						components: []
					}
				}
			);
		}
	}
}
