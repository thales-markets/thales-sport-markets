import { getEnv, ViteEnvKeys } from 'config/general';

export const SNAPSHOT_GRAPHQL_URL = `https://hub.snapshot.org/graphql?apiKey=${getEnv(
    ViteEnvKeys.VITE_APP_SNAPSHOT_API_KEY
)}`;
export const SNAPSHOT_SCORE_URL = `https://score.snapshot.org/?apiKey=${getEnv(ViteEnvKeys.VITE_APP_SNAPSHOT_API_KEY)}`;

export const VOTING_COUNCIL_PROPOSAL_ID = '0x3ab392fdc7d84df10cef6fd8e275263c88cdbdcdd15cec4352c92b2dc6518813';
