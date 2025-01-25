import { CLIENT } from '@/';
import {
	type APIInteraction,
	type APIMessage,
	ComponentType,
	InteractionType
} from 'discord-api-types/v10';

export async function ButtonAuxiliar(i: APIInteraction) {
	if (
		i.type !== InteractionType.MessageComponent ||
		i.data.component_type !== ComponentType.Button
	)
		return;

	const userid = i.member?.user.id ?? i.user?.id;
	const id_args = i.data.custom_id.split('.');
	switch (true) {
		case i.data.custom_id.startsWith('delete.eval'): {
			//console.log(id_args, i.data.custom_id, i.user?.id);
			if (id_args.pop() !== userid) {
				CLIENT.rest.post<APIMessage>(`/interactions/${i.id}/${i.token}/callback`, {
					body: {
						type: 4,
						data: {
							content:
								"Hold it right there! This isn't for you, so don't even try it, okay?",
							flags: 1 << 6
						}
					} as unknown as Record<string, object>
				});
				return;
			}
			CLIENT.rest.delete(
				`/channels/${i.message.channel_id}/messages/${i.message.id}`
			);
		}
	}
}
