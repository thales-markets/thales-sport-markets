import { PayloadAction } from '@reduxjs/toolkit';
import { Dispatch, useEffect } from 'react';
import { setSpeedMarketsWidgetOpen } from 'redux/modules/ui';
import { delay } from 'utils/timer';

const getWidgetBotCrateElement = () => {
    const widgetBotHtml = document.getElementsByTagName('widgetbot-crate') as HTMLCollection;
    const crateDivElement = (widgetBotHtml.item(0)?.firstChild?.firstChild as Element)?.shadowRoot?.firstChild
        ?.firstChild as HTMLDivElement;
    return crateDivElement;
};

const useWidgetBotScript = (preventWidgetLoad: boolean, dispatch: Dispatch<PayloadAction<boolean>>) => {
    useEffect(() => {
        if (preventWidgetLoad || (window as any).crate) {
            return;
        }

        const script = document.createElement('script');

        script.src = 'https://cdn.jsdelivr.net/npm/@widgetbot/crate@3';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            new (window as any).Crate({
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

            const crateDivElement = getWidgetBotCrateElement();

            if (getWidgetBotCrateElement()) {
                crateDivElement.addEventListener('click', async () => {
                    await delay(100);
                    const refreshedCrateDivElement = getWidgetBotCrateElement();
                    if (refreshedCrateDivElement && refreshedCrateDivElement.classList.contains('open')) {
                        dispatch(setSpeedMarketsWidgetOpen(false));
                    }
                });
            }
        };

        document.body.appendChild(script);

        return () => {
            // clean up the script when the component in unmounted
            document.body.removeChild(script);
        };
    }, [preventWidgetLoad, dispatch]);
};

export default useWidgetBotScript;
