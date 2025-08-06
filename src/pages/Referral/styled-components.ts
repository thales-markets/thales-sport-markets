import Button from 'components/Button';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivRow } from 'styles/common';

export const PageWrapper = styled(FlexDivColumn)`
    width: 1078px;
    gap: 18px;
    margin: 64px auto 0;

    @media (max-width: 768px) {
        width: calc(100% - 5px);
        margin: 10px;
    }
`;

export const HeaderSection = styled(FlexDivRow)`
    width: 100%;
    gap: 16px;
    align-items: flex-start;
    height: 310px;

    @media (max-width: 768px) {
        flex-direction: column;
        height: auto;
    }
`;

export const MainSection = styled.div`
    width: 100%;
    height: 310px;
    background: linear-gradient(90deg, #1f274d 0%, #3c498a 100%);
    border-radius: 16px;
    padding: 26px 35px;
    color: white;
    position: relative;
    @media (max-width: 768px) {
        width: 100%;
        height: auto;
        padding: 17px 13px;
    }
`;

export const MainTitle = styled.h1`
    font-family: 'Outfit', sans-serif;
    font-size: 28px;
    font-weight: 400;
    line-height: 30px;
    margin: 0 0 7px 0;
    height: 38px;
    @media (max-width: 768px) {
        font-size: 24px;
        text-align: center;
    }
`;

export const MainSubtitle = styled.p`
    font-family: 'Outfit', sans-serif;
    font-size: 16px;
    font-weight: 400;
    color: #cbd5e0;
    line-height: 20px;
    margin-bottom: 20px;
    @media (max-width: 768px) {
        font-size: 12px;
    }
`;

export const AffiliateContainer = styled.div`
    background: #1b2141;
    border-radius: 12px;
    padding: 20px 10px;
    position: relative;
`;

export const SectionLabel = styled.div`
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    color: #a0aec0;
    height: 15px;
    margin-bottom: 30px;
`;

export const AffiliateLinkLabel = styled.div`
    top: -20px;
    position: absolute;
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    color: #a0aec0;
    height: 15px;
`;

export const InputRow = styled(FlexDivRow)`
    position: relative;
    gap: 8px;
    align-items: center;
    justify-content: left;
    flex-wrap: wrap;
`;

export const AffiliateInput = styled.input`
    width: calc(100% - 316px);
    height: 34px;
    background: white;
    border: none;
    border-radius: 5px;
    padding: 7px 16px;
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    color: #504f4f;
    line-height: 20px;
    &:focus {
        outline: none;
    }
    @media (max-width: 768px) {
        width: 100%;
        font-size: 12px;
    }
`;

export const CreateButton = styled(Button)`
    width: 150px;
    height: 34px;
    background: #ffb600;
    border: none;
    border-radius: 5px;
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    color: #1b2141;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 16px;
    position: relative;
    @media (max-width: 768px) {
        width: calc(50% - 4px);
    }
`;

export const CopyButton = styled(Button)`
    width: 150px;
    height: 34px;
    background: #3fffff;
    border: none;
    border-radius: 5px;
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    color: #1b2141;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 16px;
    position: relative;
    @media (max-width: 768px) {
        width: calc(50% - 4px);
    }
`;

export const CreateIcon = styled.div`
    width: 20px;
    height: 20px;
    border: 2px solid #1b2141;
    border-radius: 50%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    &::before {
        content: '';
        position: absolute;
        width: 10px;
        height: 2px;
        background: #1b2141;
        border-radius: 3px;
    }

    &::after {
        content: '';
        position: absolute;
        width: 2px;
        height: 10px;
        background: #1b2141;
        border-radius: 3px;
    }
`;

export const CopyIcon = styled.div`
    cursor: pointer;
    width: 15px;
    height: 16px;
    background-image: url("data:image/svg+xml,%3Csvg width='15' height='17' viewBox='0 0 15 17' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M13.125 12.963H7.5C6.46582 12.963 5.625 12.0575 5.625 10.9438V2.86689C5.625 1.75316 6.46582 0.847656 7.5 0.847656H11.6045C11.9766 0.847656 12.334 1.00856 12.5977 1.29252L14.5869 3.4348C14.8506 3.71875 15 4.10367 15 4.50436V10.9438C15 12.0575 14.1592 12.963 13.125 12.963ZM1.875 4.88612H4.6875V6.40054H1.875C1.61719 6.40054 1.40625 6.6277 1.40625 6.90535V14.9823C1.40625 15.2599 1.61719 15.4871 1.875 15.4871H7.5C7.75781 15.4871 7.96875 15.2599 7.96875 14.9823V13.9727H9.375V14.9823C9.375 16.096 8.53418 17.0015 7.5 17.0015H1.875C0.84082 17.0015 0 16.096 0 14.9823V6.90535C0 5.79162 0.84082 4.88612 1.875 4.88612Z' fill='%231B2141'/%3E%3C/svg%3E");
`;

export const HowItWorksSection = styled.div`
    background: #1f274d;
    border-radius: 12px;
    padding: 22px 32px;
    @media (max-width: 768px) {
        padding: 20px 10px;
    }
`;

export const SectionTitle = styled.h2`
    font-family: 'Outfit', sans-serif;
    font-size: 20px;
    font-weight: 400;
    color: white;
    margin: 0 0 20px 0;
    height: 25px;
    @media (max-width: 768px) {
        text-align: center;
    }
`;

export const StepsContainer = styled(FlexDivRow)`
    gap: 24px;
    justify-content: center;
    align-items: flex-start;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: center;
    }
`;

export const Step = styled.div`
    width: 322px;
    height: 220px;
    background: #1b2141;
    border-radius: 12px;
    padding: 24px;
    position: relative;
    @media (max-width: 768px) {
        width: 350px;
    }
`;

export const StepNumber = styled.div`
    width: 40px;
    height: 40px;
    background: #3c498a;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Outfit', sans-serif;
    font-size: 18px;
    font-weight: 400;
    color: white;
    margin-bottom: 18px;
    @media (max-width: 768px) {
        margin: auto;
        margin-bottom: 12px;
    }
`;

export const StepTitle = styled.h3`
    font-family: 'Outfit', sans-serif;
    font-size: 16px;
    font-weight: 400;
    color: white;
    margin: 0 0 11px 0;
    height: 20px;
    @media (max-width: 768px) {
        text-align: center;
    }
`;

export const StepDescription = styled.p`
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: #a0aec0;
    line-height: 150%;
    margin: 0;
    width: 273px;
    height: 61px;
    @media (max-width: 768px) {
        text-align: center;
    }
`;

export const LeaderboardSection = styled.div`
    background: #1f274d;
    border-radius: 12px;
    padding: 23px 28px;
    position: relative;
    @media (max-width: 768px) {
        padding: 20px 10px;
    }
`;

export const LeaderboardHeader = styled(FlexDivRow)`
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
    height: 34px;
`;

export const TabsContainer = styled(FlexDivRow)`
    gap: 50px;
    align-items: flex-start;
    @media (max-width: 768px) {
        gap: 0;
        justify-content: space-between;
        width: 100%;
    }
`;

export const Tab = styled.div<{ active: boolean }>`
    display: flex;
    gap: 8px;
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    font-weight: 400;
    color: ${(props) => (props.active ? '#3FFFFF' : '#A0AEC0')};
    cursor: pointer;
    padding-bottom: 8px;
    border-bottom: ${(props) => (props.active ? '2px solid #3FFFFF' : 'none')};
    text-align: center;
    height: 30px;
    span {
        line-height: 22px;
    }
    @media (max-width: 768px) {
        font-size: 12px;
    }
`;

export const UserPosition = styled(FlexDiv)`
    justify-content: space-between;
    background: #3c4989;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
    position: relative;
`;

export const UserPositionLabel = styled.div`
    font-family: 'Inter', sans-serif;
    font-size: 10px;
    font-weight: 400;
    color: white;
    top: 23px;
    left: 58px;
    height: 12px;
    text-transform: uppercase;
    margin-left: 8px;
`;

export const UserRankBadge = styled.div`
    top: 14px;
    left: 16px;
    width: 32px;
    height: 32px;
    background: #ffb600;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: #111325;
`;

export const UserStats = styled.div`
    font-family: 'Inter', sans-serif;
    font-size: 10px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
    height: 12px;
    margin-left: 3px;
`;

export const UserXPContainer = styled(FlexDivRow)`
    gap: 16px;
    align-items: center;
`;

export const UserXP = styled.div`
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: ${(props) => props.theme.overdrop.textColor.octonary};
    @media (max-width: 768px) {
        font-size: 12px;
    }
`;

export const RankNumber = styled.div<{ highlighted?: boolean }>`
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: ${(props) => (props.highlighted ? '#FFBE00' : '#3C498A')};
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', sans-serif;
    font-size: 10px;
    font-weight: 600;
    color: ${(props) => (props.highlighted ? '#111325' : 'white')};
`;

export const FAQSection = styled.div`
    background: #1f274d;
    border-radius: 8px;
    padding: 29px 39px;
    @media (max-width: 768px) {
        padding: 20px 10px;
    }
`;

export const FAQTitle = styled.h2`
    font-family: 'Inter', sans-serif;
    font-size: 18px;
    font-weight: 500;
    color: white;
    margin: 0 0 6px 0;
    width: 261px;
    height: 21px;
`;

export const FAQSubtitle = styled.p`
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: #7983a9;
    margin: 0 0 21px 0;
    height: 26px;
`;

export const FAQItem = styled.div<{ expanded: boolean }>`
    height: ${(props) => (props.expanded ? 'auto' : '56px')};
    background: #1b2141;
    border-radius: 8px;
    margin-bottom: 6px;
    overflow: hidden;
    transition: height 0.3s ease;
`;

export const FAQQuestion = styled.div`
    height: 56px;
    padding: 19px 28px;
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    font-weight: 500;
    color: white;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    @media (max-width: 768px) {
        padding: 19px 18px;
        font-size: 13px;
        line-height: 18px;
    }
`;

export const FAQIcon = styled.div<{ expanded: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const FAQAnswer = styled.div`
    padding: 0 28px 28px 28px;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: #8f92bc;
    line-height: 1.5;

    div {
        margin-bottom: 8px;

        &:last-child {
            margin-bottom: 0;
        }
    }

    strong {
        color: #3fffff;
    }
`;

export const ExternalArrow = styled.i`
    font-size: 12px;
    color: #3fffff;
    cursor: pointer;
`;

export const getTableProps = (isMobile?: boolean) =>
    isMobile
        ? {
              tableHeadCellStyles: {
                  fontFamily: `'Outfit', sans-serif`,
                  fontSize: `12px`,
                  fontWeight: `400`,
                  color: `#a0aec0`,
                  justifyContent: 'center',
              },
              tableHeadTitleStyles: { textTransform: 'capitalize' as any, textAlign: 'center' as any },
              tableRowStyles: { minHeight: '50px', fontSize: '12px' },
              tableRowCellStyles: { justifyContent: 'center', textAlign: 'center' as any },
          }
        : {
              tableHeadCellStyles: {
                  fontFamily: `'Outfit', sans-serif`,
                  fontSize: `16px`,
                  fontWeight: `400`,
                  color: `#a0aec0`,
                  justifyContent: 'center',
              },
              tableHeadTitleStyles: { textTransform: 'capitalize' as any },
              tableRowStyles: { minHeight: '50px', fontSize: '12px' },
              tableRowCellStyles: { justifyContent: 'center' },
          };

export const HintText = styled.p`
    font-size: 12px;
    color: #999; // light gray for hint text
    margin-top: 4px;
    margin-bottom: 16px;

    a {
        color: #3fffff; // match your hover or accent color
        text-decoration: underline;
        &:hover {
            opacity: 0.8;
        }
    }
`;
