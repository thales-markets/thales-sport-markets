import useBadgeHistoryQuery from 'queries/overdrop/useBadgeHistoryQuery';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import styled from 'styled-components';
import { formatCurrency, formatPercentage } from 'thales-utils';
import { formatPoints, getCurrentLevelByPoints, getMonthName } from 'utils/overdrop';
import { useAccount } from 'wagmi';

const BadgeHistory: React.FC = () => {
    const { t } = useTranslation();

    const isMobile = useSelector(getIsMobile);

    const { address, isConnected } = useAccount();

    const badgeHistoryQuery = useBadgeHistoryQuery(address || '', { enabled: isConnected });

    const badgeHistory = badgeHistoryQuery?.data ?? { history: [], badges: {} };

    return isConnected && badgeHistory?.badges ? (
        <Container>
            <HeaderRow isMobile={isMobile}>
                <span>{t('overdrop.badge-history.month')}</span>
                {!isMobile && <span>{t('overdrop.badge-history.rank')}</span>}
                <span>{t('overdrop.badge-history.eth-rewards')}</span>
                <span>{t('overdrop.badge-history.total-xp')}</span>
                <span>{t('overdrop.badge-history.loyalty-bonus')}</span>
            </HeaderRow>
            {badgeHistory.history.map((badge, index) => {
                const levelItem = getCurrentLevelByPoints(badge?.points ?? 0);
                return (
                    <Row key={index} isMobile={isMobile}>
                        <span>{getMonthName(badge.month)}</span>
                        {!isMobile && levelItem && (
                            <BadgeContainer>
                                <Badge src={levelItem.largeBadge} /> <span>{levelItem?.levelName}</span>
                            </BadgeContainer>
                        )}
                        <span>{formatCurrency(badge.rewards.eth, 6)}</span>
                        <span>{formatPoints(badge.points, true)}</span>
                        <span>
                            {formatPercentage(
                                (badgeHistory.badges?.[`${badge.year}-${String(badge.month).padStart(2, '0')}`] || 0) /
                                    100,
                                0
                            )}
                        </span>
                    </Row>
                );
            })}
        </Container>
    ) : (
        <></>
    );
};

const Container = styled.div``;

const HeaderRow = styled.div<{ isMobile?: boolean }>`
    display: grid;
    grid-template-columns:
        12%
        20%
        ${(props) => !props.isMobile && '20%'}
        20%
        12%;
    padding: 10px;
    text-align: center;
    margin-top: 10px;
    justify-content: space-between;
    span {
        color: #5d6dbf;
        font-family: Roboto;
        font-size: 13px;
        font-style: normal;
        font-weight: 600;
        line-height: normal;
        text-transform: capitalize;
    }
`;

const Row = styled.div<{ isMobile?: boolean }>`
    display: grid;
    grid-template-columns:
        12%
        20%
        ${(props) => !props.isMobile && '20%'}
        20%
        12%;
    align-items: center;
    gap: 1%; /* spacing between cells */
    background: #151b36;
    border-radius: 8px;
    margin-top: 10px;
    justify-content: space-between;
    padding: 10px;
    span {
        text-align: center;
    }
    span:nth-child(1) {
        color: #fff;
        font-family: Inter;
        font-size: 13px;
        font-style: normal;
        font-weight: 600;
        line-height: normal;
    }
    div > span {
        color: rgba(255, 255, 255, 0.7);

        font-family: Outfit;
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
    }
    span:nth-child(3),
    span:nth-child(4) {
        color: #dba111;
        text-align: center;
        font-family: Outfit;
        font-size: 16.523px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
    }
    span:nth-child(5) {
        color: #3fffff;
        text-align: center;
        font-family: Outfit;
        font-size: 16.523px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
    }

    @media (max-width: 767px) {
        span:nth-child(4) {
            color: #3fffff;
            text-align: center;
            font-family: Outfit;
            font-size: 16.523px;
            font-style: normal;
            font-weight: 400;
            line-height: normal;
        }
    }
`;

const BadgeContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
`;

const Badge = styled.img`
    width: 44px;
    height: 44px;
`;

export default BadgeHistory;
