import { DiscordClient } from '../../bot.js';
import { CommandInterface, EventInterface } from '../../typings/index';
import { Events, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

const event: EventInterface = {
    name: Events.InteractionCreate,
    options: { once: false, rest: false },
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        if (!interaction.isChatInputCommand()) return;

        const command: CommandInterface | undefined = client.commands.get(interaction.commandName);

        const errEmbed = new EmbedBuilder().setColor('Red');
        const redCross = client.config.emojis.redCross;

        if (!command) {
            return interaction.reply({
                embeds: [errEmbed.setDescription(`${redCross} ***Error finding that command***`)],
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand(false);
        try {
            if (subcommand) {
                const subCommandFile = client.subcommands.get(`${interaction.commandName}.${subcommand}`);
                subCommandFile?.execute(interaction, client);
            } else {
                command.execute(interaction, client);
            }
        } catch (error) {
            return interaction.reply({
                embeds: [errEmbed.setDescription(`${redCross} ***Error finding that subCommand***`)],
                ephemeral: true
            });
        }

        const member = interaction.guild?.members.cache.get(interaction.user.id)!;

        const player = client.poru.players.get(interaction.guild?.id!);
        const memberVc = member.voice.channelId;
        const botVc = interaction.guild?.members.me?.voice.channelId;

        if (command.inVc && !memberVc)
            return interaction.reply({
                embeds: [
                    errEmbed.setDescription(`${redCross} ***You must be in a voice channel to use this command!***`)
                ]
            });
        if (command.sameVc && player && botVc !== memberVc)
            return interaction.reply({
                embeds: [
                    errEmbed.setDescription(
                        `${redCross} ***You must be in the same voice channel as mine to use this command!***`
                    )
                ]
            });
        if (command.currentTrack && !player?.currentTrack)
            return interaction.reply({
                embeds: [errEmbed.setDescription(`${redCross} ***No track is currnetly being played!***`)]
            });
    }
};

export default event;
