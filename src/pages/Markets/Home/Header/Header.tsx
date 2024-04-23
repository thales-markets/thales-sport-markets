import { BetTypeNameMap } from 'constants/tags';
import { BetType } from 'enums/markets';
import { useDispatch, useSelector } from 'react-redux';
import { getBetTypeFilter, getIsThreeWayView, setBetTypeFilter, setIsThreeWayView } from 'redux/modules/market';
import { ArrowIcon, BetTypeButton, BetTypesContainer, Container, ThreeWayIcon } from './styled-components';

type HeaderProps = {
    availableBetTypes: BetType[];
};

const Header: React.FC<HeaderProps> = ({ availableBetTypes }) => {
    const dispatch = useDispatch();
    const isThreeWayView = useSelector(getIsThreeWayView);
    const betTypeFilter = useSelector(getBetTypeFilter);

    return (
        <Container>
            <ArrowIcon
                flip
                className="icon icon--arrow"
                onClick={() => {
                    document.getElementById('bet-types-container')?.scrollBy({
                        left: -200,
                        behavior: 'smooth',
                    });
                }}
            />
            <BetTypesContainer id="bet-types-container">
                {availableBetTypes.map((betType) => (
                    <BetTypeButton
                        onClick={() =>
                            betTypeFilter === betType
                                ? dispatch(setBetTypeFilter(undefined))
                                : dispatch(setBetTypeFilter(betType))
                        }
                        selected={betTypeFilter === betType}
                        key={betType}
                    >
                        {BetTypeNameMap[betType]}
                    </BetTypeButton>
                ))}
            </BetTypesContainer>
            <ArrowIcon
                onClick={() => {
                    document.getElementById('bet-types-container')?.scrollBy({
                        left: 200,
                        behavior: 'smooth',
                    });
                }}
                className="icon icon--arrow"
            />
            <ThreeWayIcon
                onClick={() => dispatch(setIsThreeWayView(!isThreeWayView))}
                className={`icon ${isThreeWayView ? 'icon--profile' : 'icon--filters'}`}
            />
        </Container>
    );
};

export default Header;
