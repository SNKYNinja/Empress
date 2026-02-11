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
        .setName("disconnect")
        .setDescription("Disconnect the player from the voice channel")
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .setContexts(InteractionContextType.Guild),
    player: true,
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const player = client.poru.players.get(interaction.guild!.id)!;

        const embed = EmbedHandler.create({
            author: {
                name: interaction.user.displayName,
                iconURL: interaction.user.displayAvatarURL(),
            },
            description: `*Player disconnected ― <#${player.voiceChannel}>*`,
            color: Colors.ALL.blue,
            timestamp: true,
        });

        player.destroy();
        await interaction.reply({ embeds: [embed] });
    },
};

export default command;
