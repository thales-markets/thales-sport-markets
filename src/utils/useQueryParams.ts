import { useState } from 'react';
import { ifIpfsDeployment } from './routes';

const getQuery = () => {
    if (typeof window !== 'undefined') {
        if (ifIpfsDeployment) {
            const { hash } = window.location;
            const queryParamsAsText = hash.split('?');
            return new URLSearchParams('?' + queryParamsAsText);
        }
        return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams();
};

const getQueryStringVal = (key: string): string | null => {
    return getQuery().get(key);
};

const useQueryParam = (key: string, defaultVal: string): [string, (val: string) => void] => {
    const [query, setQuery] = useState(getQueryStringVal(key) || defaultVal);

    const updateUrl = (newVal: string) => {
        setQuery(newVal);

        const query = getQuery();

        if (newVal.trim() !== '') {
            query.set(key, newVal);
        } else {
            query.delete(key);
        }

        if (typeof window !== 'undefined') {
            if (ifIpfsDeployment) {
                const newUrl = `?${query.toString()}`;
                window.history.pushState({}, '', newUrl);
            } else {
                const { protocol, pathname, host } = window.location;
                const newUrl = `${protocol}//${host}${pathname}?${query.toString()}`;
                window.history.pushState({}, '', newUrl);
            }
        }
    };

    return [query, updateUrl];
};

export default useQueryParam;
