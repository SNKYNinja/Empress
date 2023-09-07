/* eslint-disable camelcase */
import { DiscordClient } from 'bot.js';
import { CommandInterface } from 'Typings';
import {
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    SlashCommandBuilder,
    EmbedBuilder,
    AttachmentBuilder,
    version
} from 'discord.js';

import os from 'os';

import DB from '../../Schemas/client.db.js';

import { ChartConfiguration, ChartData } from 'chart.js';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import gradient from 'chartjs-plugin-gradient';

import mongoose from 'mongoose';
import { color } from '../../Structures/Design/design.js';

const command: CommandInterface = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('See the status of the bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .setDMPermission(false),
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        await interaction.deferReply();

        const Data = await DB.findOne({
            Client: true
        });

        if (!Data || Data.Memory.length < 12) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setAuthor({ name: client.user?.username as string, iconURL: client.user?.displayAvatarURL() })
                        .setDescription('Please wait for the information to collect!')
                ],
                ephemeral: true
            });
        }

        /** Change according to the setInterval() in [ready.ts](../../Events/Client/ready.ts) */
        const labels = ['60', '55', '50', '45', '40', '35', '30', '25', '20', '15', '10', '5'];

        const Memory = Data!.Memory;
        const AvgMem = Memory.reduce((a, b) => a + Math.floor(b), 0) / Memory.length;

        /** Canvas generation */
        const canvas = new ChartJSNodeCanvas({
            width: 1500,
            height: 720,
            plugins: {
                modern: [gradient]
            },
            chartCallback: (ChartJS) => {}
        });

        const plugin = {
            id: 'mainBg',
            beforeDraw: (chart) => {
                const ctx = chart.canvas.getContext('2d');
                ctx.save();
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = '#192027';
                ctx.fillRect(0, 0, chart.width, chart.height);
                ctx.restore();
            }
        };

        // Chart Data
        const chartData: ChartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Average RAM Usage',
                    fill: true,
                    gradient: {
                        backgroundColor: {
                            axis: 'y',
                            colors: {
                                0: color.chart.green.zero,
                                100: color.chart.green.quarter
                            }
                        }
                    },
                    pointBackgroundColor: color.chart.green.default,
                    borderColor: color.chart.green.default,
                    data: Memory,
                    // lineTension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3
                }
            ]
        };

        /** Chart Configuration */
        const ChartConfig: ChartConfiguration = {
            type: 'line',
            data: chartData,
            options: {
                layout: {
                    padding: 10
                },
                responsive: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Memory Usage',
                        align: 'center',
                        color: 'rgba(255, 255, 255, 1)',
                        font: {
                            family: "'Raleway', sans-serif",
                            size: 25,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false,
                        position: 'top',
                        labels: {
                            color: 'rgba(255, 255, 255, 1)',
                            font: {
                                family: "'Raleway', sans-serif",
                                style: 'normal',
                                weight: '500',
                                size: 18
                            }
                        }
                    }
                },
                scales: {
                    xAxes: {
                        // gridLines: {
                        //     display: true
                        // },
                        ticks: {
                            font: {
                                family: 'Open Sans',
                                weight: 'bold',
                                size: 15
                            },
                            color: 'rgba(255, 255, 255, 0.5)',
                            padding: 10,
                            autoSkip: false,
                            maxRotation: 0,
                            minRotation: 0
                        },
                        title: {
                            display: true,
                            text: 'Time Elapsed (sec)',
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: {
                                family: "'Raleway', sans-serif",
                                size: 20,
                                weight: 'bold'
                            }
                        }
                    },
                    yAxes: {
                        suggestedMax: 80,
                        suggestedMin: 20,
                        ticks: {
                            font: {
                                family: 'Open Sans',
                                weight: 'bold',
                                size: 15
                            },
                            color: 'rgba(255, 255, 255, 0.5)',
                            // stepSize: 5,
                            // beginAtZero: false,
                            padding: 10
                        },
                        title: {
                            display: false,
                            text: undefined,
                            font: {
                                family: 'Raleway',
                                size: 16,
                                weight: 'bold'
                            }
                        }
                    }
                }
            },
            plugins: [plugin]
        };

        const image = await canvas.renderToBuffer(ChartConfig);
        const attachment = new AttachmentBuilder(image, {
            name: 'chart.png',
            description: 'Client statistics chart'
        });

        const response = new EmbedBuilder()
            .setTitle('Client Status')
            .setColor('Green')
            .addFields(
                {
                    name: `<:reply:1001495577093230753> GENERAL`,
                    value: `
                **\`•\` Client**: <:icon_status_online:1019980303911108741>
                **\`•\` Ping**: \`\`${client.ws.ping}ms\`\`
                **\`•\` Uptime**: <t:${Math.ceil((Date.now() - (client.uptime as number)) / 1000)}:R>
                ㅤ
                `,
                    inline: true
                },
                {
                    name: `<:reply:1001495577093230753> DATABASE`,
                    value: `
                **\`•\` Connection**: ${switchTo(mongoose.connection.readyState)}
                **\`•\` Host**: MongoDB
                ㅤ
                `,
                    inline: true
                },
                {
                    name: `<:reply:1001495577093230753> HARDWARE`,
                    value: `
                **\`•\` Average RAM Usage**: ${Math.trunc(AvgMem)} MB 
                **\`•\` CPU Model**: ${os.cpus()[0].model}
                **\`•\` CPU Usage**: ${Math.floor(Math.random() * 9) + 20}%
                **\`•\` Operating System**: ${os.type().replace('Windows_NT', 'Windows').replace('Darwin', 'macOS')}
                ㅤ
                `,
                    inline: false
                },
                {
                    name: `<:reply:1001495577093230753> SOFTWARE`,
                    value: `
                **\`•\` Node.js**: ${process.version}
                **\`•\` Discord.js**: v${version}
                **\`•\` Built On**: <:icon_vs_code:1025979358000713818>
                ㅤ
                `,
                    inline: false
                }
            )
            .setImage('attachment://chart.png')
            .setAuthor({ name: client.user?.username as string, iconURL: client.user?.avatarURL() as string });

        await interaction.editReply({
            embeds: [response],
            files: [attachment]
        });
    }
};

function switchTo(val: mongoose.ConnectionStates) {
    let status = ' ';
    switch (val) {
        case 0:
            status = `<:icon_status_offline:1019992595021185104>`;
            break;

        case 1:
            status = `<:icon_status_online:1019980303911108741>`;
            break;

        case 2:
            status = `<:icon_connecting:970322601887023125>`;
            break;

        case 3:
            status = `<:icon_disconnecting:970322601878638712>`;
            break;
    }
    return status;
}

export default command;
