import { LINKS } from 'constants/links';
import { ErrorInfo } from 'react';
import { isMobile } from 'utils/device';

const DISCORD_MESSAGE_MAX_LENGTH = 2000;

export const logError = (error: Error, info: ErrorInfo) => {
    if (import.meta.env.DEV) {
        return;
    }

    let content = `IsMobile: ${isMobile()}\nError:\n${error.stack || error.message}`;
    const flags = 4; // SUPPRESS_EMBEDS
    fetch(LINKS.Discord.OvertimeErrors, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, flags }),
    });

    content = `ErrorInfo:${info.componentStack}`;
    if (content.length > DISCORD_MESSAGE_MAX_LENGTH) {
        content = content.substring(0, DISCORD_MESSAGE_MAX_LENGTH);
    }
    fetch(LINKS.Discord.OvertimeErrors, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, flags }),
    });
    console.error(error, info);
};
