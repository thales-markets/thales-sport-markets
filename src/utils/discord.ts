import { generalConfig } from 'config/general';
import { INVALID_MIME_TYPE_ERRORS, MODULE_IMPORT_ERRORS, USER_REJECTED_ERRORS } from 'constants/errors';
import { ErrorInfo } from 'react';
import { isMobile } from 'utils/device';

const EXCLUDE_ERRORS = [...USER_REJECTED_ERRORS];
const DEPLOY_ERRORS = [...MODULE_IMPORT_ERRORS, ...INVALID_MIME_TYPE_ERRORS];

export const isErrorExcluded = (error: Error) =>
    EXCLUDE_ERRORS.some((excluded) => (error.message + (error.stack || '')).includes(excluded));

export const isDeployError = (errorMessage: string) =>
    DEPLOY_ERRORS.some((deployError) => (errorMessage || '').includes(deployError));

export const logErrorToDiscord = (error: Error, info: ErrorInfo, data?: string) => {
    const content = `IsMobile: ${isMobile()}\n${data ? `${data}\n` : ''}Error:\n${
        error.message + '\n' + (error.stack || '')
    }\n${info.componentStack ? `ErrorInfo:\n${info.componentStack}` : ''}`;

    fetch(`${generalConfig.API_URL}/discord/log-error`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
    });

    console.error(error, info);
};
