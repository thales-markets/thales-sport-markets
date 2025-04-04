import SPAAnchor from 'components/SPAAnchor';
import ROUTES from 'constants/routes';
import { secondsToMilliseconds } from 'date-fns';
import { ProfileTab } from 'enums/ui';
import { ProfileIconWidget } from 'layouts/DappLayout/DappHeader/components/ProfileItem/ProfileItem';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getTicket } from 'redux/modules/ticket';
import { useTheme } from 'styled-components';
import { buildHref } from 'utils/routes';
import { useAccount } from 'wagmi';
import { Container, ItemContainer, ItemIcon, ItemLabel, ParlayNumber } from './styled-components';

type FooterSidebarMobileProps = {
    setParlayMobileVisibility: (value: boolean) => void;
    setShowBurger?: (value: boolean) => void;
};

const FooterSidebarMobile: React.FC<FooterSidebarMobileProps> = ({ setParlayMobileVisibility, setShowBurger }) => {
    const { t } = useTranslation();
    const { isConnected } = useAccount();
    const theme = useTheme();
    const ticket = useSelector(getTicket);

    const [pulse, setPulse] = useState(false);

    const ticketLength = useMemo(() => {
        return ticket.length;
    }, [ticket]);

    useEffect(() => {
        const animate = () => {
            setPulse(true);

            setTimeout(() => setPulse(false), secondsToMilliseconds(ticket.length === 1 ? 2 : ticket.length));
        };

        animate();
    }, [ticket.length]);

    return (
        <Container>
            {isConnected && (
                <>
                    <SPAAnchor href={buildHref(`${ROUTES.Profile}?selected-tab=${ProfileTab.OPEN_CLAIMABLE}`)}>
                        <ItemContainer>
                            <ProfileIconWidget margin="auto" avatarSize={20} color={theme.textColor.primary} />
                            <ItemLabel>{t('markets.nav-menu.items.profile')}</ItemLabel>
                        </ItemContainer>
                    </SPAAnchor>
                    <SPAAnchor href={buildHref(`${ROUTES.Profile}?selected-tab=${ProfileTab.ACCOUNT}`)}>
                        <ItemContainer>
                            <ItemIcon className={'icon icon--logo'} />
                            <ItemLabel>{t('markets.nav-menu.items.account')}</ItemLabel>
                        </ItemContainer>
                    </SPAAnchor>
                </>
            )}
            <ItemContainer onClick={() => setParlayMobileVisibility(true)}>
                <ItemIcon iteration={ticketLength} className={`icon icon--ticket-horizontal ${pulse ? 'pulse' : ''}`} />
                {ticketLength > 0 && <ParlayNumber>{ticketLength || ''}</ParlayNumber>}

                <ItemLabel>{t('markets.nav-menu.items.ticket-slip')}</ItemLabel>
            </ItemContainer>
            {setShowBurger && (
                <ItemContainer>
                    <ItemIcon
                        className="icon icon--filters2"
                        fontSize={22}
                        onClick={() => {
                            setShowBurger(true);
                        }}
                    />
                    <ItemLabel>{t('common.filters')}</ItemLabel>
                </ItemContainer>
            )}
        </Container>
    );
};

export default FooterSidebarMobile;
