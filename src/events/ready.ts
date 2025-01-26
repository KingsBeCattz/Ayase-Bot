import { User } from '@kodkord/classes';
import { GatewayDispatchEvents } from 'discord-api-types/v10';
import { Panic, Trace } from 'kodkord';
import CONFIG from 'src/ayase.config.json';
import { Event } from 'src/classes/event';
import { CACHE, CLIENT, COMMANDS, UTILS } from '..';

export default new Event(GatewayDispatchEvents.Ready, async (data) => {
	await COMMANDS.uploader
		.upload()
		.then(() =>
			new Trace('COMMAND UPLOADER', `Uploaded: ${COMMANDS.size} commands`).trace()
		)
		.catch((e) => new Panic('COMMAND UPLOADER', String(e)).panic());
	//@ts-expect-error
	CACHE.USERS.set(data.user.id, new User(CLIENT.rest, data.user));
	const status = UTILS.random.on_array(CONFIG.status, 1)[0];
	new Trace(
		'Status',
		`${data.user.username} logged into Discord | Status: ${status.name} (${status.type})`
	).trace();

	UTILS.setStatus(status);
	setInterval(() => {
		const _newStatus = UTILS.random.on_array(CONFIG.status, 1)[0];
		new Trace(
			'Status Update',
			`Setting new status: ${_newStatus.name} (${_newStatus.type})`
		).trace();
		UTILS.setStatus(_newStatus);
	}, 15000);
});
