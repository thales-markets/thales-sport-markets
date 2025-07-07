import { useEffect } from 'react';

const useWidgetBotScript = (preventWidgetLoad: boolean) => {
    useEffect(() => {
        if (preventWidgetLoad || (window as any).crate) {
            return;
        }

        const script = document.createElement('script');

        script.src = 'https://cdn.jsdelivr.net/npm/@widgetbot/crate@3';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            const crate = new (window as any).Crate({
                server: '906484044915687464',
                channel: '983394762520412160',
                notifications: false,
                indicator: false,
                shard: 'https://e.widgetbot.io',
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

            // TODO: check when discord is working
            crate.on('open', () => {
                console.log('✅ WidgetBot has been opened!');
                // Your custom logic here
            });

            crate.on('close', () => {
                console.log('❎ WidgetBot has been closed!');
            });

            // Optional: catch all events
            crate.on('*', (event: string, data: any) => {
                console.log(`[WidgetBot Event] ${event}`, data);
            });
        };

        document.body.appendChild(script);

        return () => {
            // clean up the script when the component in unmounted
            document.body.removeChild(script);
        };
    }, [preventWidgetLoad]);
};

export default useWidgetBotScript;
