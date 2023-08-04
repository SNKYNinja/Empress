import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { SubCommandInterface } from 'Typings';

const command: SubCommandInterface = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user or remove a warn')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand((subCmd) =>
            subCmd
                .setName('add')
                .setDescription('Warn a user')
                .addUserOption((option) =>
                    option.setName('user').setDescription('Select the user to warn').setRequired(true)
                )
                .addStringOption((option) =>
                    option.setName('reason').setDescription('The reason for the warn').setMinLength(5).setMaxLength(500)
                )
        )
        .addSubcommand((subCmd) =>
            subCmd
                .setName('remove')
                .setDescription('Remove a warn from a user')
                .addStringOption((option) =>
                    option.setName('warn_id').setDescription('The ID of the warn to remove').setRequired(true)
                )
        )
};

export default command;
