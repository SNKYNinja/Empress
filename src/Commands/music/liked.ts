import { SubCommandInterface } from 'Typings';
import { SlashCommandBuilder } from 'discord.js';

const command: SubCommandInterface = {
    data: new SlashCommandBuilder()
        .setName('liked')
        .setDescription('Manage your saved tracks')
        .setDMPermission(false)
        .addSubcommand((subCommand) =>
            subCommand
                .setName('load')
                .setDescription('Play your saved tracks!')
                .addStringOption((option) =>
                    option
                        .setName('query')
                        .setDescription('Choose the saved track to play!')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
};

export default command;
