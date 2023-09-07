import { SubCommandInterface } from 'Typings';
import { SlashCommandBuilder } from 'discord.js';

const command: SubCommandInterface = {
    data: new SlashCommandBuilder()
        .setName('playlist')
        .setDescription('Manage your music bot playlist')
        .setDMPermission(false)
        .addSubcommand((subcommand) => subcommand.setName('create').setDescription('Create a new playlist'))
        .addSubcommand((subcommand) =>
            subcommand
                .setName('delete')
                .setDescription('Delete an existing playlist')
                .addStringOption((option) =>
                    option
                        .setName('playlist')
                        .setDescription('Choose the playlist')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('view')
                .setDescription('Display a playlist in detailed view')
                .addStringOption((option) =>
                    option
                        .setName('playlist')
                        .setDescription('Choose the playlist')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
};

export default command;
