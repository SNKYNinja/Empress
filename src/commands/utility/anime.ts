import axios from 'axios';
import { DiscordClient } from 'bot';
import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { CommandInterface } from 'typings';

const command: CommandInterface = {
    data: new SlashCommandBuilder()
        .setName('anime')
        .setDescription('Search for any anime with Jikan API')
        .addStringOption((option) =>
            option.setName('query').setDescription('Search query for the anime').setRequired(true)
        ),
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        await interaction.deferReply();
        const query = interaction.options.getString('query');

        interface AnimeData {
            mal_id: number;
            url: string;
            images: {
                jpg: {
                    image_url: string;
                    small_image_url: string;
                    large_image_url: string;
                };
                webp: {
                    image_url: string;
                    small_image_url: string;
                    large_image_url: string;
                };
            };
            trailer: {
                youtube_id: string;
                url: string;
                embed_url: string;
                images: {
                    image_url: string;
                    small_image_url: string;
                    medium_image_url: string;
                    large_image_url: string;
                    maximum_image_url: string;
                };
            };
            approved: boolean;
            titles: {
                type: 'Default' | 'Synonym' | 'Japanese' | 'English' | 'German' | 'Spanish' | 'French';
                title: string;
            }[];
            title: string;
            title_english: string;
            title_japanese: string;
            title_synonyms: string[];
            type: string;
            source: string;
            episodes: number;
            status: string;
            airing: boolean;
            aired: {
                from: string;
                to: string;
                prop: {
                    from: any; // You can replace 'any' with the appropriate type if available
                    to: any; // You can replace 'any' with the appropriate type if available
                };
                string: string;
            };
            duration: string;
            rating:
                | 'G - All Ages'
                | 'PG - Children'
                | 'PG-13 - Teens 13 or older'
                | 'R - 17+ (violence & profanity)'
                | 'R+ - Mild Nudity'
                | 'Rx - Hentai';
            score: number;
            scored_by: number;
            rank: number;
            popularity: number;
            members: number;
            favorites: number;
            synopsis: string;
            background: string | null;
            season: string;
            year: number;
            broadcast: {
                day: string;
                time: string;
                timezone: string;
                string: string;
            };
            producers: {
                mal_id: number;
                type: string;
                name: string;
                url: string;
            }[];
            licensors: any[]; // You can replace 'any' with the appropriate type if available
            studios: {
                mal_id: number;
                type: string;
                name: string;
                url: string;
            }[];
            genres: {
                mal_id: number;
                type: string;
                name: string;
                url: string;
            }[];
            explicit_genres: any[]; // You can replace 'any' with the appropriate type if available
            themes: {
                mal_id: number;
                type: string;
                name: string;
                url: string;
            }[];
            demographics: any[]; // You can replace 'any' with the appropriate type if available
        }

        const URL = ` https://api.jikan.moe/v4/anime?q=${query}&sfw`;

        axios
            .get(URL)
            .then((res) => {
                const anime: AnimeData = res.data.data[0];

                const resEmbed = new EmbedBuilder()
                    .setTitle(`${anime.titles[3].title} | ${anime.titles[2].title}`)
                    .setURL(anime.url)
                    .setColor('#2F3136')
                    .setAuthor({ name: client.user?.username!, iconURL: client.user?.avatarURL()! })
                    .setThumbnail(anime.images.jpg.large_image_url)
                    .setDescription(anime.synopsis)
                    .addFields([
                        { name: 'Ranked', value: `#${anime.rank}`, inline: true },
                        { name: 'Popularity', value: `#${anime.popularity}`, inline: true },
                        { name: 'Show Type', value: anime.type, inline: true },
                        { name: 'No. of Episodes', value: `${anime.episodes}`, inline: true },
                        {
                            name: 'Episode Length',
                            value: `${anime.duration.split(' ')[0]}min` || `Unknown`,
                            inline: true
                        },
                        { name: 'Average Rating', value: `${anime.score}/10`, inline: true },
                        { name: 'Genres', value: anime.genres.map((g) => g.name).join(', '), inline: true },
                        { name: 'Season', value: anime.season[0].toUpperCase() + anime.season.slice(1), inline: true },
                        { name: 'Age Rating', value: anime.rating, inline: true }
                    ]);

                interaction.editReply({
                    embeds: [resEmbed]
                });
            })
            .catch((err) => {
                console.log(err);
                interaction.editReply({
                    content: 'An error occured!'
                });
            });
    }
};

export default command;
