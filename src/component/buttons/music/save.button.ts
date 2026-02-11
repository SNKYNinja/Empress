import { ButtonInterface } from "@/typings";
import { DiscordClient } from "@/bot";
import { ButtonInteraction } from "discord.js";
import { MusicUtils } from "@/functions/music-utils";

const button: ButtonInterface = {
    id: "save",
    player: true,
    currentTrack: true,
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        await MusicUtils.saveTrack(interaction, client);
    },
};

export default button;
