import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { SubCommandInterface } from 'typings';

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
                        .setDescription('The messsage users will see on the ticket panel')
                        .setRequired(false)
                )
        )
        .addSubcommand((subcommand) => 
            subcommand
                .setName('config')
                .setDescription('Configure ticket system settings'))
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
};

export default command;
