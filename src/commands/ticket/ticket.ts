import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { SubCommandInterface } from 'Typings';

const command: SubCommandInterface = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Ticket system configuration ')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setDMPermission(false)
        .addSubcommand((subcommand) =>
            subcommand
                .setName('setup')
                .setDescription('Setup channels and roles for the ticket system')
                .addChannelOption((option) =>
                    option
                        .setName('channel')
                        .setDescription('Select the channel to setup the ticket system')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)
                )
                .addChannelOption((option) =>
                    option
                        .setName('transcript')
                        .setDescription('Select the channel for the transcripts to be sent')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)
                )
                .addChannelOption((option) =>
                    option
                        .setName('category')
                        .setDescription('Select the category in which the ticket channels will be generator')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildCategory)
                )
                .addRoleOption((option) =>
                    option
                        .setName('role')
                        .setDescription('Select the role which will manage the tickets')
                        .setRequired(true)
                )
                .addStringOption((options) =>
                    options
                        .setName('message')
                        .setDescription('The age users will see on the ticket panel')
                        .setRequired(false)
                )
        )
        .addSubcommand((subcommand) => subcommand.setName('config').setDescription('Configure ticket system settings'))
        .addSubcommand((subcommand) =>
            subcommand
                .setName('delete')
                .setDescription('Select the ticket data you want to delete')
                .addStringOption((option) =>
                    option
                        .setName('data')
                        .setDescription('Select the ticket data you want to delete')
                        .setRequired(true)
                        .addChoices({ name: 'Setup', value: 'setup' }, { name: 'Tickets', value: 'tickets' })
                )
        )
        .addSubcommandGroup((group) =>
            group
                .setName('user')
                .setDescription('Add/remove users from a ticket')
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('add')
                        .setDescription('Add a user to the current ticket')
                        .addUserOption((user) =>
                            user
                                .setName('user')
                                .setDescription('Select the user to add to the ticket')
                                .setRequired(true)
                        )
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('remove')
                        .setDescription('Remove a user from the current ticket')
                        .addUserOption((user) =>
                            user
                                .setName('user')
                                .setDescription('Select the user to remove from this ticket')
                                .setRequired(true)
                        )
                )
        )
};

export default command;
