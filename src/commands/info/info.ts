import { SubCommandInterface } from '../../Typings/index';
import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

const command: SubCommandInterface = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Display a simple info embed depending on what you want')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .setDMPermission(false)
        .addSubcommand((subcommand) =>
            subcommand
                .setName('user')
                .setDescription("Display the user's info")
                .addUserOption((options) =>
                    options.setName('target').setDescription('Provide a user').setRequired(true)
                )
        )
        .addSubcommand((subcommand) => subcommand.setName('server').setDescription("Display the server's info"))
};

export default command;
