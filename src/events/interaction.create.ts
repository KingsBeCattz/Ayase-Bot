import { Interaction } from '@kodkord/classes';
import {
	GatewayDispatchEvents,
	type InteractionType
} from 'discord-api-types/v10';
import { Event } from 'src/classes/event';
import { CLIENT } from '..';
import { ButtonAuxiliar } from './ignore/interaction.auxiliar/button.interaction';
import { InteractionCommandAuxiliar } from './ignore/interaction.auxiliar/command.interaction';
import { HelpAuxiliar } from './ignore/interaction.auxiliar/help.selectmenu.interaction';

export default new Event(
	GatewayDispatchEvents.InteractionCreate,
	async (data) => {
		//@ts-expect-error
		const i = new Interaction(CLIENT.rest, data);
		ButtonAuxiliar(i);
		HelpAuxiliar(i);
		InteractionCommandAuxiliar(
			i as Interaction<InteractionType.ApplicationCommand>
		);
	}
);
