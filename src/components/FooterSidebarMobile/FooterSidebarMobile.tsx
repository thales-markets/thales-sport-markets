import SPAAnchor from 'components/SPAAnchor';
import ROUTES from 'constants/routes';
import { secondsToMilliseconds } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getTicket } from 'redux/modules/ticket';
import { buildHref } from 'utils/routes';
import { useAccount } from 'wagmi';
import { Container, ItemContainer, ItemIcon, ParlayNumber } from './styled-components';

type FooterSidebarMobileProps = {
    setParlayMobileVisibility: (value: boolean) => void;
    setShowBurger?: (value: boolean) => void;
};

const FooterSidebarMobile: React.FC<FooterSidebarMobileProps> = ({ setParlayMobileVisibility, setShowBurger }) => {
    const { isConnected } = useAccount();

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
                <ItemContainer>
                    <SPAAnchor href={buildHref(ROUTES.Profile)}>
                        <ItemIcon className="icon icon--profile2" />
                    </SPAAnchor>
                </ItemContainer>
            )}
            <ItemContainer onClick={() => setParlayMobileVisibility(true)}>
                <ItemIcon
                    fontSize={36}
                    iteration={ticketLength}
                    className={`icon icon--ticket-horizontal ${pulse ? 'pulse' : ''}`}
                />
                <ParlayNumber>{ticketLength || ''}</ParlayNumber>
            </ItemContainer>
            {setShowBurger && (
                <ItemContainer>
                    <ItemIcon
                        className="icon icon--sports"
                        fontSize={44}
                        onClick={() => {
                            setShowBurger(true);
                        }}
                    />
                </ItemContainer>
            )}
        </Container>
    );
};

export default FooterSidebarMobile;
