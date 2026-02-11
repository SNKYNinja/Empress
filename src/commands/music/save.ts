import type { DiscordClient } from "@/bot";
import {
    type ChatInputCommandInteraction,
    InteractionContextType,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from "discord.js";
import type { CommandInterface } from "@/typings";
import { MusicUtils } from "@/functions/music-utils";

const command: CommandInterface = {
    data: new SlashCommandBuilder()
        .setName("save")
        .setDescription("Save the current track")
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .setContexts(InteractionContextType.Guild),
    player: true,
    currentTrack: true,
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        await MusicUtils.saveTrack(interaction, client);
    },
};

export default command;
