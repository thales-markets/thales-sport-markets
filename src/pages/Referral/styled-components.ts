import Button from 'components/Button';
import styled from 'styled-components';
import { FlexDiv, FlexDivColumn, FlexDivColumnNative, FlexDivRow } from 'styles/common';

export const Wrapper = styled(FlexDivColumnNative)`
    font-size: 14px;
    font-weight: 400;
    max-width: 1200px;
    width: 100%;
    align-items: flex-start;
    margin-top: 20px;
    @media (max-width: 767px) {
        width: 100%;
        min-width: auto;
    }
`;

export const MainInfoContainer = styled(FlexDivRow)`
    width: 100%;
    align-items: flex-start;
    @media (max-width: 767px) {
        flex-direction: column;
    }
`;

export const ButtonContainer = styled(FlexDivColumnNative)`
    width: 50%;
    @media (max-width: 767px) {
        width: 100%;
    }
`;

export const InfoContainer = styled(FlexDivColumnNative)`
    border: 1.5px solid ${(props) => props.theme.borderColor.quaternary};
    border-radius: 12px;
    padding: 15px;
    margin-left: 15px;
    justify-content: space-between;
    width: 50%;
    @media (max-width: 767px) {
        margin-left: 0px;
        margin-top: 10px;
        width: 100%;
    }
`;

export const KeyValueContainer = styled(FlexDivRow)`
    width: 100%;
    margin-bottom: 6px;
`;

export const Label = styled.span<{ win?: boolean }>`
    text-transform: uppercase;
    color: ${(props) => (props?.win ? props.theme.status.win : props.theme.textColor.quaternary)};
    ::after {
        content: ': ';
    }
`;

export const Value = styled.span<{ win?: boolean }>`
    font-weight: 600;
    color: ${(props) => (props?.win ? props.theme.status.win : props.theme.textColor.primary)};
`;

export const ParagraphContainer = styled(FlexDivColumnNative)`
    margin-top: 15px;
`;

export const ParagraphHeader = styled.h1`
    font-size: 20px;
    font-weight: 600;
    line-height: 120%;
    margin-bottom: 12px;
`;

export const Paragraph = styled.p`
    font-size: 12px;
    line-height: 150%;
    color: ${(props) => props.theme.textColor.primary};
`;

export const Row = styled(FlexDiv)`
    width: 100%;
    gap: 18px;
    min-height: 200px;
`;

export const Section = styled.div<{ gradient?: boolean; flex?: number }>`
    padding: 30px;
    flex: ${(props) => props.flex || 1};
    background: ${(props) =>
        props.gradient ? ` linear-gradient(90deg, #1F274D 0%, #3C498A 100%)` : props.theme.background.secondary};
    border-radius: 8px;
`;

export const CreateAffiliateTitle = styled.div`
    font-family: 'Outfit' !important;
    font-size: 30px;
    margin-bottom: 10px;
`;

export const CreateAffiliateSubtitle = styled.div`
    font-family: 'Outfit' !important;
    font-size: 16px;
    color: #cbd5e0;
`;

export const CreateAffiliateInputContainer = styled.div`
    background: #1b2141;
    border-radius: 8px;
    height: 115px;
    width: 90%;
    margin-top: 60px;
    padding: 10px;
`;

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
    line-height: 16px;
    margin: 0 0 60px 0;
    height: 20px;
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

export const ShareSection = styled.div`
    position: absolute;
    top: 18px;
    right: 23px;
`;

export const SocialIcons = styled(FlexDivRow)`
    position: absolute;
    top: 42px;
    right: 0;
    gap: 23px;
    width: 131px;
    height: 18px;
`;

export const XIcon = styled.div`
    width: 17px;
    height: 18px;
    background-image: url("data:image/svg+xml,%3Csvg width='17' height='18' viewBox='0 0 17 18' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10.119 7.19917L16.4486 0H14.9492L9.45087 6.24966L5.0626 0H0L6.63737 9.45149L0 17H1.4994L7.30207 10.3987L11.9374 17H17M2.04057 1.10634H4.34407L14.9481 15.948H12.644' fill='%233FFFFF'/%3E%3C/svg%3E");
    cursor: pointer;
`;

export const FacebookIcon = styled.div`
    width: 18px;
    height: 18px;
    background-image: url("data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M49.0088 10.125L49.5087 6.86742H46.383V4.75348C46.383 3.86227 46.8196 2.99355 48.2195 2.99355H49.6405V0.220078C49.6405 0.220078 48.351 0 47.1181 0C44.5439 0 42.8614 1.56023 42.8614 4.38469V6.86742H40V10.125H42.8614V18H46.383V10.125H49.0088Z' fill='%233FFFFF'/%3E%3C/svg%3E");
    cursor: pointer;
`;

export const TelegramIcon = styled.div`
    width: 18px;
    height: 18px;
    background-image: url("data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M81.3594 0C76.5441 0 72.6406 3.9035 72.6406 8.71875C72.6406 13.534 76.5441 17.4375 81.3594 17.4375C86.1746 17.4375 90.0781 13.534 90.0781 8.71875C90.0781 3.9035 86.1746 0 81.3594 0ZM85.4007 5.92945C85.2695 7.30811 84.7017 10.6537 84.4128 12.1978C84.2906 12.8512 84.0499 13.0703 83.8169 13.0917C83.3107 13.1383 82.9261 12.7571 82.4358 12.4356C81.6684 11.9326 81.2349 11.6195 80.49 11.1286C79.6292 10.5614 80.1872 10.2497 80.6778 9.73993C80.8062 9.60659 83.037 7.57747 83.0802 7.39339C83.0856 7.37037 83.0908 7.28441 83.0396 7.23927C82.9885 7.19413 82.9134 7.20942 82.8591 7.22169C82.7822 7.23918 81.5563 8.04943 79.1815 9.65246C78.8336 9.89139 78.5184 10.0078 78.236 10.0017C77.9247 9.99499 77.3259 9.82572 76.8807 9.68098C76.3347 9.50351 75.9007 9.40968 75.9385 9.10825C75.9582 8.95121 76.1744 8.79067 76.5871 8.62661C79.1288 7.51923 80.8237 6.78915 81.6717 6.43637C84.093 5.42925 84.5961 5.25431 84.924 5.24848C84.9962 5.24728 85.1574 5.26514 85.2619 5.3499C85.3314 5.41028 85.3757 5.49454 85.386 5.58601C85.4037 5.69959 85.4086 5.81478 85.4007 5.92945Z' fill='%233FFFFF'/%3E%3C/svg%3E");
    cursor: pointer;
`;

export const WhatsAppIcon = styled.div`
    width: 18px;
    height: 18px;
    background-image: url("data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M128.382 2.61562C126.699 0.928125 124.457 0 122.074 0C117.156 0 113.154 4.00179 113.154 8.91964C113.154 10.4906 113.564 12.0254 114.344 13.3795L113.078 18L117.807 16.7585C119.109 17.4696 120.575 17.8433 122.07 17.8433H122.074C126.988 17.8433 131.078 13.8415 131.078 8.92366C131.078 6.54107 130.066 4.30312 128.382 2.61562ZM122.074 16.3406C120.74 16.3406 119.434 15.983 118.297 15.308L118.028 15.1473L115.224 15.8826L115.971 13.1464L115.794 12.8652C115.051 11.6839 114.661 10.3219 114.661 8.91964C114.661 4.83348 117.988 1.5067 122.078 1.5067C124.059 1.5067 125.919 2.27812 127.317 3.68036C128.716 5.08259 129.575 6.94286 129.571 8.92366C129.571 13.0138 126.16 16.3406 122.074 16.3406ZM126.14 10.7879C125.919 10.6754 124.822 10.1371 124.617 10.0647C124.413 9.98839 124.264 9.95223 124.115 10.1772C123.967 10.4022 123.541 10.9004 123.408 11.0531C123.279 11.2018 123.147 11.2219 122.926 11.1094C121.616 10.4545 120.756 9.94018 119.892 8.45759C119.663 8.06384 120.121 8.09196 120.547 7.24018C120.62 7.09152 120.583 6.96295 120.527 6.85045C120.471 6.73795 120.025 5.64107 119.84 5.19509C119.659 4.76116 119.475 4.82143 119.338 4.81339C119.209 4.80536 119.061 4.80536 118.912 4.80536C118.763 4.80536 118.522 4.86161 118.317 5.08259C118.112 5.30759 117.538 5.84598 117.538 6.94286C117.538 8.03973 118.338 9.10045 118.446 9.24911C118.558 9.39777 120.017 11.6478 122.255 12.6161C123.669 13.2268 124.224 13.279 124.931 13.1746C125.361 13.1103 126.249 12.6362 126.433 12.1138C126.618 11.5915 126.618 11.1455 126.562 11.0531C126.51 10.9527 126.361 10.8964 126.14 10.7879Z' fill='%233FFFFF'/%3E%3C/svg%3E");
    cursor: pointer;
`;

export const StatsSection = styled.div`
    width: 257px;
    height: 309px;
    background: #1f274d;
    border-radius: 8px;
    color: white;
    padding: 30px 24px;
    display: flex;
    flex-direction: column;

    @media (max-width: 768px) {
        width: 100%;
    }
`;

export const StatsHeader = styled(FlexDiv)`
    align-items: center;
    gap: 8px;
    margin-bottom: 28px;
`;

export const StatsContent = styled(FlexDivColumn)`
    flex: 1;
    gap: 16px;
`;

export const TrophyIcon = styled.div`
    width: 20px;
    height: 18px;
    background-image: url("data:image/svg+xml,%3Csvg width='21' height='18' viewBox='0 0 21 18' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14.0625 0H6.1875C5.25586 0 4.49648 0.766406 4.53164 1.69453C4.53867 1.88086 4.5457 2.06719 4.55625 2.25H0.84375C0.376172 2.25 0 2.62617 0 3.09375C0 6.34922 1.17773 8.61328 2.75977 10.1496C4.31719 11.6648 6.21563 12.4277 7.61484 12.8145C8.4375 13.043 9 13.7285 9 14.4176C9 15.1523 8.40234 15.75 7.66758 15.75H6.75C6.12773 15.75 5.625 16.2527 5.625 16.875C5.625 17.4973 6.12773 18 6.75 18H13.5C14.1223 18 14.625 17.4973 14.625 16.875C14.625 16.2527 14.1223 15.75 13.5 15.75H12.5824C11.8477 15.75 11.25 15.1523 11.25 14.4176C11.25 13.7285 11.809 13.0395 12.6352 12.8145C14.0379 12.4277 15.9363 11.6648 17.4937 10.1496C19.0723 8.61328 20.25 6.34922 20.25 3.09375C20.25 2.62617 19.8738 2.25 19.4062 2.25H15.6937C15.7043 2.06719 15.7113 1.88437 15.7184 1.69453C15.7535 0.766406 14.9941 0 14.0625 0ZM1.71914 3.9375H4.68633C5.00625 7.10508 5.71289 9.22148 6.51094 10.6383C5.63555 10.2516 4.725 9.70664 3.9375 8.94023C2.8125 7.84688 1.89844 6.26836 1.72266 3.9375H1.71914ZM16.316 8.94023C15.5285 9.70664 14.618 10.2516 13.7426 10.6383C14.5406 9.22148 15.2473 7.10508 15.5672 3.9375H18.5344C18.3551 6.26836 17.441 7.84688 16.3195 8.94023H16.316Z' fill='%23DBA111'/%3E%3C/svg%3E");
    flex-shrink: 0;
`;

export const StatsTitle = styled.h3`
    font-family: 'Inter', sans-serif;
    font-size: 18px;
    font-weight: 700;
    margin: 0;
    color: #fff;
    line-height: 21px;
`;

export const StatRow = styled(FlexDivRow)`
    justify-content: space-between;
    align-items: center;
    height: 17px;
    width: 100%;
`;

export const StatLabel = styled.span`
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: #a0aec0;
    line-height: 14px;
`;

export const StatValue = styled.span`
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: white;
    line-height: 14px;
`;

export const NextRewardValue = styled.span`
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #3fffff;
    line-height: 14px;
`;

export const ProgressSection = styled.div`
    margin-top: 22px;
    width: 100%;
`;

export const ProgressRow = styled(FlexDivRow)`
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
    width: 100%;
`;

export const ProgressLabel = styled.div`
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: #a0aec0;
    line-height: 12px;
`;

export const ProgressPercent = styled.div`
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #dba111;
    line-height: 12px;
`;

export const ProgressBar = styled.div`
    width: 100%;
    height: 6px;
    background: #111325;
    border-radius: 9999px;
    overflow: hidden;
`;

export const ProgressFill = styled.div`
    height: 100%;
    background: linear-gradient(90deg, #3fffff 0%, #dba111 100%);
    border-radius: 9999px;
    transition: width 0.3s ease;
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
    height: 196px;
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

export const TimeFilter = styled.div`
    width: 100px;
    height: 28px;
    background: #111325;
    border-radius: 6px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', sans-serif;
    font-size: 10px;
    font-weight: 400;
    color: #a0aec0;
    cursor: pointer;
    gap: 14px;
`;

export const DropdownIcon = styled.div`
    width: 8px;
    height: 5px;
    background-image: url("data:image/svg+xml,%3Csvg width='9' height='6' viewBox='0 0 9 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M0.183623 0.766823C0.29823 0.656559 0.451926 0.596306 0.610935 0.599307C0.769944 0.602307 0.921257 0.668314 1.03162 0.782823L3.99962 3.93322L6.96762 0.782823C7.02157 0.723347 7.08691 0.675305 7.15977 0.641545C7.23263 0.607784 7.31152 0.588991 7.39177 0.58628C7.47202 0.583568 7.552 0.596993 7.62697 0.625759C7.70194 0.654525 7.77038 0.698047 7.82822 0.753745C7.88606 0.809444 7.93213 0.876186 7.9637 0.950017C7.99528 1.02385 8.01171 1.10327 8.01203 1.18356C8.01234 1.26386 7.99654 1.34341 7.96555 1.41749C7.93456 1.49156 7.88902 1.55867 7.83162 1.61482L4.43162 5.21482C4.37565 5.27289 4.30855 5.31908 4.23432 5.35063C4.1601 5.38218 4.08028 5.39844 3.99962 5.39844C3.91897 5.39844 3.83915 5.38218 3.76492 5.35063C3.6907 5.31908 3.62359 5.27289 3.56762 5.21482L0.167623 1.61482C0.0573591 1.50022 -0.00289327 1.34652 0.000106905 1.18751C0.00310708 1.0285 0.0691143 0.877189 0.183623 0.766823Z' fill='%23A0AEC0'/%3E%3C/svg%3E");
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

export const UserName = styled.div`
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: white;
    width: 235px;
    height: 17px;
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
    color: #dba111;
    @media (max-width: 768px) {
        font-size: 12px;
    }
`;

export const GrowthIndicator = styled.div`
    font-family: 'Inter', sans-serif;
    font-size: 10px;
    font-weight: 400;
    color: #28dd6e;
    display: flex;
    align-items: center;
    gap: 4px;
    height: 12px;
`;

export const GrowthArrow = styled.div`
    width: 9px;
    height: 10px;
    background-image: url("data:image/svg+xml,%3Csvg width='9' height='11' viewBox='0 0 9 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4.83237 0.219727C4.5519 -0.0732422 4.09642 -0.0732422 3.81596 0.219727L0.225975 3.96973C-0.0544918 4.2627 -0.0544918 4.73848 0.225975 5.03145C0.506443 5.32441 0.961922 5.32441 1.24239 5.03145L3.60729 2.55879V9.74941C3.60729 10.1643 3.92814 10.4994 4.32529 10.4994C4.72243 10.4994 5.04328 10.1643 5.04328 9.74941V2.55879L7.40818 5.0291C7.68865 5.32207 8.14413 5.32207 8.4246 5.0291C8.70506 4.73613 8.70506 4.26035 8.4246 3.96738L4.83461 0.217383L4.83237 0.219727Z' fill='%2328DD6E'/%3E%3C/svg%3E");
`;

export const ProgressContainer = styled.div`
    position: absolute;
    bottom: 16px;
    left: 373px;
    right: 16px;
    display: flex;
    align-items: center;
    gap: 20px;
`;

export const ProgressToNext = styled.div`
    font-family: 'Inter', sans-serif;
    font-size: 10px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
    width: 103px;
    height: 12px;
`;

export const UserProgressBar = styled.div`
    flex: 1;
    height: 6px;
    background: rgba(17, 19, 37, 0.8);
    border-radius: 4px;
    overflow: hidden;
    max-width: 492px;
`;

export const UserProgressFill = styled.div`
    height: 100%;
    background: linear-gradient(90deg, #3fffff 0%, #dba111 100%);
    border-radius: 4px;
    transition: width 0.3s ease;
`;

export const UserProgressPercent = styled.div`
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: #ffb600;
    width: 26px;
    height: 12px;
`;

export const TableHeaders = styled(FlexDivRow)`
    margin-bottom: 16px;
    padding-left: 17px;
    height: 20px;
`;

export const TableHeader = styled.div`
    font-family: 'Outfit', sans-serif;
    font-size: 16px;
    font-weight: 400;
    color: #a0aec0;
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

export const TableContainer = styled.div`
    margin-left: 17px;
    padding-top: 4px;
`;

export const TableRow = styled(FlexDivRow)`
    margin-bottom: 23px;
    padding: 16px 0;
    border-bottom: 1px solid #4e5fb1;
    height: 18px;
    align-items: center;
`;

export const TableCell = styled.div`
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: white;
    height: 18px;
    line-height: 18px;
`;

export const UpdatedTime = styled.div`
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Inter', sans-serif;
    font-size: 10px;
    font-weight: 400;
    color: #a0aec0;
    width: 111px;
    height: 12px;
`;

export const RewardsAndMissionsSection = styled(FlexDivRow)`
    gap: 16px;
    height: 316px;

    @media (max-width: 768px) {
        flex-direction: column;
        height: auto;
    }
`;

export const ReferralRewards = styled.div`
    width: 530px;
    height: 316px;
    background: #1f274d;
    border-radius: 8px;
    padding: 37px 24px;
`;

export const RewardsTitle = styled.h3`
    font-family: 'Inter', sans-serif;
    font-size: 18px;
    font-weight: 500;
    color: white;
    margin: 0 0 28px 0;
    width: 151px;
    height: 21px;
`;

export const RewardItem = styled.div`
    width: 475px;
    height: 100px;
    background: #1b2141;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
`;

export const RewardIconContainer = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

export const SilverBadgeIcon = styled.div`
    width: 48px;
    height: 48px;
    background: #3fffff;
    border-radius: 8px;
    position: relative;

    &::after {
        content: '⭐';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 24px;
        color: #111325;
    }
`;

export const GoldBadgeIcon = styled.div`
    width: 48px;
    height: 48px;
    background: #ffb600;
    border-radius: 8px;
    position: relative;

    &::after {
        content: '🏆';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 24px;
        color: #111325;
    }
`;

export const RewardInfo = styled(FlexDivColumn)`
    flex: 1;
`;

export const RewardName = styled.div`
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    font-weight: 500;
    color: white;
    margin-bottom: 6px;
    height: 20px;
`;

export const RewardRequirement = styled.div`
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 400;
    color: #a0aec0;
    margin-bottom: 12px;
    height: 12px;
`;

export const RewardProgress = styled(FlexDivRow)`
    align-items: center;
    gap: 16px;
`;

export const RewardProgressBar = styled.div`
    flex: 1;
    height: 8px;
    background: #111325;
    border-radius: 9999px;
    overflow: hidden;
    max-width: 338px;
`;

export const RewardProgressFill = styled.div`
    height: 100%;
    border-radius: 9999px;
    transition: width 0.3s ease;
`;

export const RewardProgressText = styled.div`
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
`;

export const AffiliateMissions = styled.div`
    width: 530px;
    height: 316px;
    background: #1f274d;
    border-radius: 8px;
    padding: 37px 24px;
`;

export const MissionsTitle = styled.h3`
    font-family: 'Inter', sans-serif;
    font-size: 18px;
    font-weight: 500;
    color: white;
    margin: 0 0 28px 0;
    width: 153px;
    height: 21px;
`;

export const MissionItem = styled.div`
    width: 475px;
    height: 104px;
    background: #1b2141;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    &:last-child {
        height: 94px;
    }
`;

export const MissionInfo = styled(FlexDivColumn)`
    flex: 1;
`;

export const MissionName = styled.div`
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    font-weight: 500;
    color: white;
    margin-bottom: 8px;
    height: 20px;
`;

export const MissionRequirement = styled.div`
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 400;
    color: #a0aec0;
    margin-bottom: 16px;
    height: 12px;
`;

export const MissionProgress = styled(FlexDivRow)`
    align-items: center;
    gap: 16px;
`;

export const MissionProgressBar = styled.div`
    width: 410px;
    height: 8px;
    background: #111325;
    border-radius: 9999px;
    overflow: hidden;
`;

export const MissionProgressFill = styled.div`
    height: 100%;
    background: #3fffff;
    border-radius: 9999px;
    transition: width 0.3s ease;
`;

export const MissionProgressText = styled.div`
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: #3fffff;
    white-space: nowrap;
`;

export const MissionReward = styled.div`
    background: rgba(219, 161, 17, 0.2);
    border-radius: 4px;
    padding: 4px 8px;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: #ffb600;
    white-space: nowrap;
    height: 24px;
    display: flex;
    align-items: center;
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
