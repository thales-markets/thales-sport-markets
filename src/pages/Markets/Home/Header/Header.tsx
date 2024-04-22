import { BetTypeNameMap } from 'constants/tags';
import { BetType } from 'enums/markets';
import { useDispatch, useSelector } from 'react-redux';
import { getIsThreeWayView, setIsThreeWayView } from 'redux/modules/market';
import { ArrowIcon, BetTypeButton, BetTypesContainer, Container, ThreeWayIcon } from './styled-components';

type HeaderProps = {
    availableBetTypes: BetType[];
    selectedBetTypes: BetType[];
    setSelectedBetTypes: (betTypes: BetType[]) => void;
};

const Header: React.FC<HeaderProps> = ({ availableBetTypes, selectedBetTypes, setSelectedBetTypes }) => {
    const dispatch = useDispatch();
    const isThreeWayView = useSelector(getIsThreeWayView);

    return (
        <Container>
            <ArrowIcon
                flip
                className="icon icon--arrow"
                onClick={() => {
                    document.getElementById('bet-types-container')?.scrollBy({
                        left: -100,
                        behavior: 'smooth',
                    });
                }}
            />
            <BetTypesContainer id="bet-types-container">
                {availableBetTypes.map((betType) => (
                    <BetTypeButton
                        onClick={() =>
                            selectedBetTypes.includes(betType)
                                ? setSelectedBetTypes(selectedBetTypes.filter((type) => type !== betType))
                                : setSelectedBetTypes([...selectedBetTypes, betType])
                        }
                        selected={selectedBetTypes.includes(betType)}
                        key={betType}
                    >
                        {BetTypeNameMap[betType]}
                    </BetTypeButton>
                ))}
            </BetTypesContainer>
            <ArrowIcon
                onClick={() => {
                    document.getElementById('bet-types-container')?.scrollBy({
                        left: 100,
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
