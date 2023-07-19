import { Schema, model } from 'mongoose';

interface ITicketSetup {
    guildId: string;
    channel: string;
    category: string;
    transcript: string;
    roles: string[];
    description: string;
    messageId: string;
}

const arrLimit = (arr: Array<string>) => {
    return arr.length <= 3;
};

const ticketSetupSchema = new Schema<ITicketSetup>({
    guildId: { type: String, required: true },
    channel: String,
    category: String,
    transcript: String,
    roles: {
        type: [String],
        validate: [arrLimit, 'Cannot add more than 3 roles!']
    },
    description: String,
    messageId: String
});

export default model('TicketSetup', ticketSetupSchema, 'ticketSetup');
