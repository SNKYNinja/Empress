import { DiscordClient } from 'bot.js';
import EmbedPaginator from '../../Structures/Classes/pages.js';
import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { CommandInterface } from 'Typings';

const command: CommandInterface = {
    data: new SlashCommandBuilder().setName('lavalink').setDescription('Get lavalink nodes info'),
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const Embeds: EmbedBuilder[] = [];

        client.poru.nodes.forEach((node) => {
            const embed = new EmbedBuilder()
                .setAuthor({
                    name: client.user?.username!,
                    iconURL: client.user?.avatarURL()!
                })
                .addFields([
                    {
                        name: `**Node ${node.name} Connected**`,
                        value: `\`\`\`json\nPlayer: ${node.stats?.players}\nPlaying Players: ${
                            node.stats?.playingPlayers
                        }\nUptime: ${new Date(node.stats?.uptime!).toISOString().slice(11, 19)}\`\`\``,
                        inline: false
                    },
                    {
                        name: 'CPU Info',
                        value: `\`\`\`json\nCores: ${node.stats?.cpu.cores}\nSystem Load: ${(
                            Math.round(node.stats?.cpu.systemLoad! * 100) / 100
                        ).toFixed(2)}%\nLavalink Load: ${(
                            Math.round(node.stats?.cpu.lavalinkLoad! * 100) / 100
                        ).toFixed(2)}%\`\`\``,
                        inline: false
                    },
                    {
                        name: 'Memory Info',
                        value: `\`\`\`json\nReservable Memory: ${Math.round(
                            node.stats?.memory.reservable! / 1024 / 1024
                        )}mb\nUsed Memory: ${Math.round(
                            node.stats?.memory.used! / 1024 / 1024
                        )}mb\nFree Memory: ${Math.round(
                            node.stats?.memory.free! / 1024 / 1024
                        )}mb\nAllocated Memory: ${Math.round(node.stats?.memory.allocated! / 1024 / 1024)}mb\`\`\``,
                        inline: false
                    }
                ])
                .setColor('#2F3136')
                .setThumbnail('https://media.tenor.com/8fCoAFhaseUAAAAM/aesthetic-anime.gif')
                .setImage('https://static.planetminecraft.com/files/profile_banner/2344410_3.gif');

            Embeds.push(embed);
        });

        const paginator = new EmbedPaginator(client, interaction, Embeds);
        paginator.ephemeral = true;
        paginator.loadPages();
    }
};

export default command;
