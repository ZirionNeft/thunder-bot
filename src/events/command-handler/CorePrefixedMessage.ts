import type { Message } from "discord.js";
import { Event, EventOptions, Events } from "@sapphire/framework";
import { SubCommandsEvents } from "@sapphire/plugin-subcommands";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<EventOptions>({ event: Events.PrefixedMessage })
export class UserEvent extends Event<Events.PrefixedMessage> {
	public run(message: Message, prefix: string) {
		// Retrieve the command name and validate:
		const prefixLess = message.content.slice(prefix.length).trim();
		const spaceIndex = prefixLess.indexOf(" ");
		const name =
			spaceIndex === -1 ? prefixLess : prefixLess.slice(0, spaceIndex);
		if (!name) {
			message.client.emit(Events.UnknownCommandName, message, prefix);
			return;
		}

		// Retrieve the command and validate:
		const command = message.client.commands.get(
			message.client.options.caseInsensitiveCommands
				? name.toLowerCase()
				: name
		);
		if (!command) {
			message.client.emit(Events.UnknownCommand, message, name, prefix);
			return;
		}

		// Run the last stage before running the command:
		const parameters =
			spaceIndex === -1 ? "" : prefixLess.substr(spaceIndex + 1).trim();
		message.client.emit(SubCommandsEvents.PreSubCommandRun, {
			message,
			command,
			parameters,
			context: { commandName: name, prefix },
		});
	}
}
