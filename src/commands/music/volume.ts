import type { DiscordClient } from "@/bot";
import {
    type ChatInputCommandInteraction,
    InteractionContextType,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from "discord.js";
import type { CommandInterface } from "@/typings";
import { EmbedHandler } from "@/lib/index";
import { Colors } from "@/constants/index";

const command: CommandInterface = {
    data: new SlashCommandBuilder()
        .setName("volume")
        .setDescription("Change the volume of the current track")
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .setContexts(InteractionContextType.Guild)
        .addNumberOption((option) =>
            option
                .setName("volume")
                .setDescription("The volume to set the player to")
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(200)
        ),
    player: true,
    currentTrack: true,
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const player = client.poru.players.get(interaction.guildId!)!;
        const volume = interaction.options.getNumber("volume")!;

        player.setVolume(volume);

        const embed = EmbedHandler.create({
            author: {
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL(),
            },
            color: Colors.ALL.blue,
            description: `Volume set to \`${volume}\``,
            timestamp: true
        });

        await interaction.reply({ embeds: [embed] });
    },
};

export default command;
