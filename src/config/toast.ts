import { TypeOptions } from 'react-toastify';

const defaultToastOptions = {
    isLoading: false,
    autoClose: 4000,
    hideProgressBar: false,
    pauseOnHover: true,
    draggable: true,
    closeOnClick: true,
    pauseOnFocusLoss: true,
};

export const getSuccessToastOptions = (message: string) => {
    return {
        ...defaultToastOptions,
        render: message,
        type: 'success' as TypeOptions,
    };
};

export const getErrorToastOptions = (message: string) => {
    return {
        ...defaultToastOptions,
        render: message,
        type: 'error' as TypeOptions,
    };
};
