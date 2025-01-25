import { Dictionary } from 'kodkord';

export class CooldownCache extends Dictionary<string, CooldownData> {
	constructor() {
		super(undefined, undefined, 'Cooldowns');
	}

	public setForUser(data: CooldownData) {
		return super.set(`${data.user_id}_${data.command}`, data);
	}

	public getForUser(user_id: string, command: string) {
		return super.get(`${user_id}_${command}`);
	}

	public deleteForUser(user_id: string, command: string) {
		return super.delete(`${user_id}_${command}`);
	}

	public isExpired(user_id: string, command: string) {
		const data = this.getForUser(user_id, command);
		if (!data) {
			this.deleteForUser(user_id, command);
			return true;
		}

		return Date.now() >= data.timestamp + data.time;
	}
}
