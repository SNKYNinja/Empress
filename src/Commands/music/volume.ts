import { CommandInterface } from 'Typings';
import { DiscordClient } from 'bot';
import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const command: CommandInterface = {
    player: true,
    inVc: true,
    sameVc: true,
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Change the volume of the player')
        .setDMPermission(false)
        .addNumberOption((option) =>
            option
                .setName('volume')
                .setDescription('The volume to set the player to')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(200)
        ),
    execute: (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const player = client.poru.players.get(interaction.guild!.id)!;
        const volume = interaction.options.getNumber('volume')!;

        player.setVolume(volume / 100);

        const Embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(`*Volume has been set to **${volume}%***`);

        interaction.reply({ embeds: [Embed] });
    }
};

export default command;
