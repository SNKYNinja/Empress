// declare in global space
declare global {
    // JS objects in the global namespace
    namespace NodeJS {
        interface ProcessEnv {
            DISCORD_TOKEN: string;
            DATABASE_URL: string;
            GENIUS_SECRET: string;
            SPOTIFY_ID: string;
            SPOTIFY_SECRET: string;
            NODE_ENV: 'development' | 'production';
        }
    }
}

export {};
