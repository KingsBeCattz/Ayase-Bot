import { GatewayDispatchEvents } from 'discord-api-types/v10';
import { Event } from 'src/classes/event';
import { CommandAuxiliar } from './ignore/message.auxiliar/command.create';

export default new Event(GatewayDispatchEvents.MessageCreate, async (data) => {
	CommandAuxiliar(data);
});
