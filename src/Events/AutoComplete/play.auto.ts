import { DiscordClient } from 'bot.js';
import { AutocompleteInteraction, Events } from 'discord.js';
import { EventInterface } from 'Typings';

import { parseVideo, parsedData } from '../../Functions/fetchVideo.js';
const rfc3986EncodeURIComponent = (str: string) => encodeURIComponent(str).replace(/[!'()*]/g, escape);

import axios from 'axios';

const event: EventInterface = {
    name: Events.InteractionCreate,
    options: { rest: false, once: false },
    execute: async (interaction: AutocompleteInteraction, client: DiscordClient) => {
        if (!interaction.isAutocomplete()) return;
        if (interaction.commandName !== 'play') return;

        const searchQuery = interaction.options.getFocused(true).value;
        if (searchQuery.length == 0) return interaction.respond([]);

        const spotifyMatch = /^(https:\/\/open\.spotify\.com\/(track|playlist)\/[a-zA-Z0-9]+)(\?.*)?$/.test(
            searchQuery
        );

        if (spotifyMatch) return interaction.respond([]);

        let fetched = false;
        const res = await axios.get(
            `https://www.youtube.com/results?q=${rfc3986EncodeURIComponent(searchQuery)}&hl=en`
        );
        let html = res.data;

        // try to parse html
        try {
            const data = html.split("ytInitialData = '")[1]?.split("';</script>")[0];
            html = data.replace(/\\x([0-9A-F]{2})/gi, (...items) => String.fromCharCode(parseInt(items[1], 16)));
            html = html.replaceAll('\\\\"', '');
            html = JSON.parse(html);
        } catch {
            null;
        }

        let videos: any[] = [];
        if (
            html?.contents?.sectionListRenderer?.contents?.length > 0 &&
            html.contents.sectionListRenderer.contents[0]?.itemSectionRenderer?.contents?.length > 0
        ) {
            videos = html.contents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
            fetched = true;
        }

        // backup/ alternative parsing
        if (!fetched) {
            try {
                videos = JSON.parse(
                    html.split('{"itemSectionRenderer":{"contents":')[
                        // eslint-disable-next-line no-unexpected-multiline
                        html.split('{"itemSectionRenderer":{"contents":').length - 1
                    ].split(',"continuations":[{')[0]
                );
                fetched = true;
            } catch {
                null;
            }
        }
        if (!fetched) {
            try {
                videos = JSON.parse(
                    html.split('{"itemSectionRenderer":')[
                        // eslint-disable-next-line no-unexpected-multiline
                        html.split('{"itemSectionRenderer":').length - 1
                    ].split('},{"continuationItemRenderer":{')[0]
                ).contents;
                fetched = true;
            } catch {
                null;
            }
        }

        const results: any[] = [];
        if (!fetched) return interaction.respond(results);

        for (const video of videos) {
            if (results.length >= 10) break;
            const parsed = parseVideo(video);
            if (parsed) results.push(parsed);
        }

        return interaction.respond(
            results.map((video) => ({
                name: video.title.length > 100 ? video.title.slice(0, 99) : video.title,
                value: video.url
            }))
        );
    }
};

export default event;
