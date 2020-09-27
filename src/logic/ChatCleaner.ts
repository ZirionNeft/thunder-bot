import { Message } from "discord.js";
import LoggerFactory from "../utils/LoggerFactory";
import { CommandMessage } from "@typeit/discord";
import { config } from "node-config-ts";

export interface DeletableMessage {
  message: Message | CommandMessage;
  sec?: number;
}

export default class ChatCleaner {
  static clean(...messages: DeletableMessage[]) {
    try {
      let counter = 0;
      const g = new Set();

      for (let m of messages) {
        m.message
          .delete({
            timeout: (typeof m.sec === "number" ? m.sec : 5) * 1000,
          })
          .then((msg) => {
            if (messages.length <= 1)
              LoggerFactory.get(ChatCleaner).debug(
                `Message deleted -- <${msg.id}>`
              );
            else counter++;
            msg.guild && g.add(msg.guild.id);
          });
      }
      counter &&
        LoggerFactory.get(ChatCleaner).info(
          `Messages cleaned [${counter}] in guilds [${Array.from(
            g.values(),
            (v) => `<${v}>`
          ).join(",")}]>`
        );
    } catch (e) {
      config.general.debug && LoggerFactory.get(ChatCleaner).error(e);
    }
  }
}
