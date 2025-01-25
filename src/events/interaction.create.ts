import {
	type APIChatInputApplicationCommandInteraction,
	GatewayDispatchEvents
} from 'discord-api-types/v10';
import { Event } from 'src/classes/event';
import { ButtonAuxiliar } from './ignore/interaction.auxiliar/button.interaction';
import { InteractionCommandAuxiliar } from './ignore/interaction.auxiliar/command.interaction';

export default new Event(GatewayDispatchEvents.InteractionCreate, async (i) => {
	ButtonAuxiliar(i);
	InteractionCommandAuxiliar(i as APIChatInputApplicationCommandInteraction);
});
