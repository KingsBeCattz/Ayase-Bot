import type { Client } from 'kodkord';
import type { Command } from 'src/classes/command';
import { CommandUploader } from './command.uploader';
import { Loader } from './generic.loader';

export class CommandLoader extends Loader<Command> {
	uploader: CommandUploader;
	constructor(
		public client: Client,
		public cache: string,
		public onfinish: (loader: Loader<Command>) => void
	) {
		super(onfinish);
		this.uploader = new CommandUploader(this, cache);
	}
}
