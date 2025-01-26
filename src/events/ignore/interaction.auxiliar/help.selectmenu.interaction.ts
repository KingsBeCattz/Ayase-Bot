import { CLIENT, COMMANDS } from '@/';
import type { Interaction } from '@kodkord/classes';
import {
	type APIMessageComponentSelectMenuInteraction,
	InteractionResponseType,
	type InteractionType,
	Routes
} from 'discord-api-types/v10';
import { CONSTANTS, ERROR_MESSAGES } from 'src/auxiliar/constants';
import CONFIG from 'src/ayase.config.json';

export async function HelpAuxiliar(i: Interaction<InteractionType>) {
	const raw = i.raw as APIMessageComponentSelectMenuInteraction;
	if (!i.isMessageComponent() || !raw.data.values) return;

	const userid = i.raw.member?.user.id ?? i.user()?.raw.id;
	const id_args = i.raw.data.custom_id.split('.');

	switch (true) {
		case i.raw.data.custom_id.startsWith(CONSTANTS.HELP_SELECT_MENU):
			if (id_args.pop() !== userid) {
				await CLIENT.rest.post(Routes.interactionCallback(i.raw.id, i.raw.token), {
					body: {
						type: 5
					}
				});
				i.respond({
					type: InteractionResponseType.ChannelMessageWithSource,
					data: {
						content: ERROR_MESSAGES.NOT_FOR_U,
						flags: (1 << 6) | (1 << 7)
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
						embeds: [
							{
								color: i.raw.message.embeds[0].color,
								description: `# ${raw.data.values[0].capitalize()}\n${
									Array.from(
										COMMANDS.filter(
											(c) => c.settings.category === raw.data.values[0].toUpperCase()
										)
											.values()
											.map((c) => `\`${c.data.name}\` - ${c.data.description}`)
									).join('\n') || 'Nothing is here lol'
								}`
							}
						]
					}
				}
			);
			break;
	}
}
