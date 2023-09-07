import { CommandInterface } from 'Typings';
import { DiscordClient } from 'bot';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

const command: CommandInterface = {
    data: new SlashCommandBuilder().setName('gmail').setDescription('Send a gmail to the bot owner'),
    execute: (interaction: ChatInputCommandInteraction, client: DiscordClient) => {}
};

export default command;
