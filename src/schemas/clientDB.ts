import { Schema, model } from 'mongoose';

interface IClient {
    Client: boolean;
    Memory: Array<number>;
}

const clientSchema = new Schema<IClient>({
    Client: Boolean,
    Memory: Array
});

export default model('client', clientSchema);
