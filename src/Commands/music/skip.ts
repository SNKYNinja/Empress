import { DiscordClient } from 'bot';
import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { CommandInterface } from 'Typings';

const command: CommandInterface = {
    player: true,
    inVc: true,
    sameVc: true,
    currentTrack: true,
    data: new SlashCommandBuilder().setName('skip').setDescription('Skip the current song').setDMPermission(false),
    execute: (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const player = client.poru.players.get(interaction.guild!.id)!;

        const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL()! })
            .setColor('Blue')
            .setDescription(`*Skipped ― [${player.currentTrack.info.title}](${player.currentTrack.info.uri})*`);

        interaction.reply({ embeds: [embed] });
        player.stop();
    }
};

export default command;
