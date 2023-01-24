import React, { useEffect, useMemo, useState } from 'react';

import { AccountPositionProfile } from 'queries/markets/useAccountMarketsQuery';
import {
    ClubLogo,
    ClubName,
    MatchInfo,
    MatchLabel,
    MatchLogo,
    StatusContainer,
    ClaimContainer,
    ClaimLabel,
    ClaimValue,
    ExternalLink,
    ExternalLinkArrow,
    ExternalLinkContainer,
    Label,
    ClaimButton,
} from '../../styled-components';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import { BoldValue, ColumnDirectionInfo, PositionContainer, ResultContainer, Wrapper } from './styled-components';
import { useTranslation } from 'react-i18next';
import { USD_SIGN } from 'constants/currency';
import { formatCurrencyWithSign } from 'utils/formatters/number';
import networkConnector from 'utils/networkConnector';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { ethers } from 'ethers';
import sportsMarketContract from 'utils/contracts/sportsMarketContract';
import { toast } from 'react-toastify';
import PositionSymbol from 'components/PositionSymbol';
import {
    convertPositionNameToPosition,
    convertPositionNameToPositionType,
    getCanceledGameClaimAmount,
    getOddTooltipText,
    getParentMarketAddress,
    getSpreadTotalText,
    getSymbolText,
} from 'utils/markets';
import { formatDateWithTime } from 'utils/formatters/date';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { getIsMobile } from 'redux/modules/app';
import { refetchAfterClaim } from 'utils/queryConnector';
import { buildMarketLink } from 'utils/routes';
import i18n from 'i18n';
import { MAX_GAS_LIMIT } from 'constants/network';
import useMarketTransactionsQuery from 'queries/markets/useMarketTransactionsQuery';
import { ParlaysMarket } from 'types/markets';
import { ShareTicketModalProps } from 'pages/Markets/Home/Parlay/components/ShareTicketModal/ShareTicketModal';

type SinglePositionProps = {
    position: AccountPositionProfile;
    setShareTicketModalData?: (shareTicketData: ShareTicketModalProps) => void;
    setShowShareTicketModal?: (show: boolean) => void;
};

const SinglePosition: React.FC<SinglePositionProps> = ({
    position,
    setShareTicketModalData,
    setShowShareTicketModal,
}) => {
    const language = i18n.language;
    const { t } = useTranslation();
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnect = useSelector((state: RootState) => getIsWalletConnected(state));

    const [homeLogoSrc, setHomeLogoSrc] = useState(
        getTeamImageSource(position.market.homeTeam, position.market.tags[0])
    );
    const [awayLogoSrc, setAwayLogoSrc] = useState(
        getTeamImageSource(position.market.awayTeam, position.market.tags[0])
    );

    const marketTransactionsQuery = useMarketTransactionsQuery(position.market.address, networkId, position.account, {
        enabled: isWalletConnect,
    });

    const sumOfTransactionPaidAmount = useMemo(() => {
        let sum = 0;

        if (marketTransactionsQuery.data) {
            marketTransactionsQuery.data.forEach((transaction) => {
                if (transaction.position == position.market.finalResult - 1) {
                    if (transaction.type == 'sell') sum -= transaction.paid;
                    if (transaction.type == 'buy') sum += transaction.paid;
                }
            });
        }

        return sum;
    }, [marketTransactionsQuery.data, position.market.finalResult]);

    useEffect(() => {
        setHomeLogoSrc(getTeamImageSource(position.market.homeTeam, position.market.tags[0]));
        setAwayLogoSrc(getTeamImageSource(position.market.awayTeam, position.market.tags[0]));
    }, [position.market.homeTeam, position.market.awayTeam, position.market.tags]);

    const isClaimable = position.claimable;
    const isCanceled = position.market.isCanceled;
    const positionEnum = convertPositionNameToPositionType(position ? position.side : '');
    const claimCanceledGame = isClaimable && isCanceled;

    const claimAmountForCanceledGame = claimCanceledGame ? getCanceledGameClaimAmount(position) : 0;

    const claimAmount = claimCanceledGame ? claimAmountForCanceledGame : position.amount;

    const claimReward = async () => {
        const { signer } = networkConnector;
        if (signer) {
            const contract = new ethers.Contract(position.market.address, sportsMarketContract.abi, signer);
            contract.connect(signer);
            const id = toast.loading(t('market.toast-message.transaction-pending'));
            try {
                const tx = await contract.exerciseOptions({
                    gasLimit: MAX_GAS_LIMIT,
                });
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    toast.update(id, getSuccessToastOptions(t('market.toast-message.claim-winnings-success')));
                    if (setShareTicketModalData && setShowShareTicketModal && !isCanceled) {
                        setShareTicketModalData(shareTicketData);
                        setShowShareTicketModal(true);
                    }
                }
            } catch (e) {
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                console.log(e);
            }
        }
    };

    const shareTicketData: ShareTicketModalProps = {
        markets: [
            {
                ...position.market,
                homeOdds: sumOfTransactionPaidAmount / position.amount,
                awayOdds: sumOfTransactionPaidAmount / position.amount,
                drawOdds: sumOfTransactionPaidAmount / position.amount,
                winning: position.claimable,
                position: convertPositionNameToPosition(position?.side ? position?.side : ''),
            } as ParlaysMarket,
        ],
        totalQuote: sumOfTransactionPaidAmount / position.amount,
        paid: sumOfTransactionPaidAmount,
        payout: position.amount,
        onClose: () => {
            refetchAfterClaim(walletAddress, networkId);
            setShowShareTicketModal ? setShowShareTicketModal(false) : null;
        },
    };

    const symbolText = getSymbolText(positionEnum, position.market);
    const spreadTotalText = getSpreadTotalText(position.market, positionEnum);

    return (
        <Wrapper>
            <MatchInfo>
                <MatchLogo>
                    <ClubLogo
                        alt={position.market.homeTeam}
                        src={homeLogoSrc}
                        isFlag={position.market.tags[0] == 9018}
                        losingTeam={false}
                        onError={getOnImageError(setHomeLogoSrc, position.market.tags[0])}
                        customMobileSize={'30px'}
                    />
                    <ClubLogo
                        awayTeam={true}
                        alt={position.market.awayTeam}
                        src={awayLogoSrc}
                        isFlag={position.market.tags[0] == 9018}
                        losingTeam={false}
                        onError={getOnImageError(setAwayLogoSrc, position.market.tags[0])}
                        customMobileSize={'30px'}
                    />
                </MatchLogo>
                <MatchLabel>
                    <ClubName>{position.market.homeTeam}</ClubName>
                    <ClubName>{position.market.awayTeam}</ClubName>
                </MatchLabel>
            </MatchInfo>
            <StatusContainer>
                <PositionContainer>
                    <PositionSymbol
                        symbolText={symbolText}
                        symbolUpperText={
                            spreadTotalText
                                ? {
                                      text: spreadTotalText,
                                      textStyle: {
                                          top: '-9px',
                                      },
                                  }
                                : undefined
                        }
                        tooltip={<>{getOddTooltipText(positionEnum, position.market)}</>}
                    />
                </PositionContainer>
                {isClaimable && (
                    <>
                        {isCanceled ? (
                            <ResultContainer>
                                <Label canceled={true}>{t('profile.card.canceled')}</Label>
                            </ResultContainer>
                        ) : (
                            <ColumnDirectionInfo>
                                <Label>{t('profile.card.result')}:</Label>
                                <BoldValue>{`${position.market.homeScore} : ${position.market.awayScore}`}</BoldValue>
                            </ColumnDirectionInfo>
                        )}
                        {isMobile ? (
                            <ClaimContainer>
                                <ClaimValue>{formatCurrencyWithSign(USD_SIGN, claimAmount, 2)}</ClaimValue>
                                <ClaimButton
                                    claimable={true}
                                    onClick={(e: any) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        claimReward();
                                    }}
                                >
                                    {t('profile.card.claim')}
                                </ClaimButton>
                            </ClaimContainer>
                        ) : (
                            <>
                                <ColumnDirectionInfo>
                                    <ClaimLabel>{t('profile.card.to-claim')}:</ClaimLabel>
                                    <ClaimValue>{formatCurrencyWithSign(USD_SIGN, claimAmount, 2)}</ClaimValue>
                                </ColumnDirectionInfo>
                                <ClaimButton
                                    claimable={true}
                                    onClick={(e: any) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        claimReward();
                                    }}
                                >
                                    {t('profile.card.claim')}
                                </ClaimButton>
                            </>
                        )}
                    </>
                )}
                {!isClaimable && (
                    <>
                        <ColumnDirectionInfo>
                            <Label>{t('profile.card.position-size')}:</Label>
                            <BoldValue>{formatCurrencyWithSign(USD_SIGN, position.amount)}</BoldValue>
                        </ColumnDirectionInfo>
                        <ColumnDirectionInfo>
                            <Label>{t('profile.card.starts')}:</Label>
                            <BoldValue>{formatDateWithTime(position.market.maturityDate)}</BoldValue>
                        </ColumnDirectionInfo>
                        <ExternalLink
                            href={buildMarketLink(
                                getParentMarketAddress(position.market.parentMarket, position.market.address),
                                language
                            )}
                            target={'_blank'}
                        >
                            <ExternalLinkContainer>
                                <ExternalLinkArrow />
                            </ExternalLinkContainer>
                        </ExternalLink>
                    </>
                )}
            </StatusContainer>
        </Wrapper>
    );
};

export default SinglePosition;
