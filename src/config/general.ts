export const generalConfig = {
    API_URL: 'https://overtimemarketsv2.xyz',
    OVERDROP_API_URL: process.env.REACT_APP_OVERDROP_API_URL,
};

export const noCacheConfig = { headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0' } };
