import { Schema, model, Document } from 'mongoose';

interface LikedSongs extends Document {
    userId: string;
    tracks: { name: string; url: string }[];
}

const likedSchema = new Schema<LikedSongs>({
    userId: { type: String, required: true },
    tracks: [{ name: String, url: String }]
});

export default model<LikedSongs>('Liked', likedSchema);
