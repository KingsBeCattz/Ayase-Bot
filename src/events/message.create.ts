import { Message } from '@kodkord/classes';
import { GatewayDispatchEvents, type MessageType } from 'discord-api-types/v10';
import { Event } from 'src/classes/event';
import { CLIENT } from '..';
import { CommandAuxiliar } from './ignore/message.auxiliar/command.create';

export default new Event(GatewayDispatchEvents.MessageCreate, async (data) => {
	//@ts-expect-error
	const msg = new Message(CLIENT.rest, data);
	CommandAuxiliar(msg as Message<MessageType.Default>);
});
