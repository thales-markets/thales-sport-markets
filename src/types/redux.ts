import { OddsType, SortType, SportFilter, StatusFilter } from 'enums/markets';
import { MarketTypeGroup } from 'enums/marketTypes';
import { Theme } from 'enums/ui';
import { MarketType } from 'overtime-utils';
import { ParlayPayment, Tags, TicketPosition } from './markets';
import { SelectedMarket } from './marketTypes';
import { OverdropUIState } from './overdrop';
import { TicketError } from './tickets';

export type AppSliceState = {
    isMobile: boolean;
};

export type MarketSliceState = {
    marketSearch: string;
    datePeriodFilter: number;
    statusFilter: StatusFilter;
    sportFilter: SportFilter;
    marketTypeFilter: MarketType | undefined;
    marketTypeGroupFilter: MarketTypeGroup | undefined;
    tagFilter: Tags;
    selectedMarket: SelectedMarket | undefined;
    isThreeWayView: boolean;
    sortType: SortType;
};

export type TicketSliceState = {
    ticket: TicketPosition[];
    payment: ParlayPayment;
    maxTicketSize: number;
    liveBetSlippage: number;
    isFreeBetDisabledByUser: boolean;
    isSystemBet: boolean;
    isSgp: boolean;
    error: TicketError;
};

export type UISliceState = {
    theme: Theme;
    oddsType: OddsType;
    stopPulsing: boolean;
    favouriteLeagues: Tags;
    overdropState: OverdropUIState[];
    overdropWelcomeModal: boolean;
    overdropPreventMultipliersModal: boolean;
};

export type WalletSliceState = {
    isBiconomy: boolean;
    connectedViaParticle: boolean;
    walletConnectModal: {
        visibility: boolean;
    };
};

export type RootState = {
    app: AppSliceState;
    market: MarketSliceState;
    ticket: TicketSliceState;
    ui: UISliceState;
    wallet: WalletSliceState;
};
