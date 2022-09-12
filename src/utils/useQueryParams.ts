import { useState } from 'react';
import { ifIpfsDeployment } from './routes';
import { history } from 'utils/routes';

const getQuery = () => {
    if (typeof window !== 'undefined') {
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
                const { protocol, pathname, host, hash, search } = window.location;
                console.log(query.toString());
                console.log(protocol, pathname, host, hash, search);
                const newUrl = `?${query.toString()}`;
                history.push(newUrl, '');
            } else {
                const { protocol, pathname, host } = window.location;
                console.log(query.toString());
                const newUrl = `${protocol}//${host}${pathname}?${query.toString()}`;
                window.history.pushState({}, '', newUrl);
            }
        }
    };

    return [query, updateUrl];
};

export default useQueryParam;
