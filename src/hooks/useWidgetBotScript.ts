import { useEffect } from 'react';

const useWidgetBotScript = () => {
    useEffect(() => {
        const script = document.createElement('script');

        script.src = 'https://cdn.jsdelivr.net/npm/@widgetbot/crate@3';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            new (window as any).Crate({
                server: '906484044915687464',
                channel: '907009643295940618',
                css: `
                @media (max-width: 950px) {
                    &:not(.open) .button {
                        margin-bottom: 70px;
                        width: 45px;
                        height: 45px;
                    }
                }
              `,
            });
        };

        document.body.appendChild(script);

        return () => {
            // clean up the script when the component in unmounted
            document.body.removeChild(script);
        };
    }, []);
};

export default useWidgetBotScript;
