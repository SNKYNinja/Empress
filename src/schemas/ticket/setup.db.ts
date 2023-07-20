import { Schema, model } from 'mongoose';

interface ITicketSetup {
    active: boolean;
    guildId: string;
    channel: string;
    category: string;
    transcript: string;
    roles: string[];
    messageId: string;
}

const arrLimit = (arr: Array<string>) => {
    return arr.length <= 3;
};

const ticketSetupSchema = new Schema<ITicketSetup>({
    active: { type: Boolean, default: true },
    guildId: { type: String, required: true },
    channel: String,
    category: String,
    transcript: String,
    roles: {
        type: [String],
        validate: [arrLimit, 'Cannot add more than 3 roles!']
    },
    messageId: String
});

export default model('TicketSetup', ticketSetupSchema, 'ticketSetup');
