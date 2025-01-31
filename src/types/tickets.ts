import { Coins } from 'thales-utils';
import { SystemBetData, TicketMarket } from './markets';

export type ShareTicketModalProps = {
    markets: TicketMarket[];
    multiSingle: boolean;
    paid: number;
    payout: number;
    onClose: () => void;
    isTicketLost: boolean;
    collateral: Coins;
    isLive: boolean;
    applyPayoutMultiplier: boolean;
    isTicketOpen: boolean;
    systemBetData?: SystemBetData;
};
