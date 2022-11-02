import React, { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import useFavoriteTeamDataQuery from 'queries/favoriteTeam/useFavoriteTeamDataQuery';
import { ReactComponent as SymbolsBackground } from 'assets/images/favorite-team/symbols-background.svg';
import { setTheme } from 'redux/modules/ui';
import { Theme } from 'constants/ui';
import Loader from 'components/Loader';
import { Container, SymbolsContainer } from './styled-components';
import Eligible from './components/Eligible';
import NotEligible from './components/NotEligible';
import ChooseNFT from './components/ChooseNFT';
import AlreadyMinted from './components/AlreadyMinted';
import Header from './components/Header';

const MintWorldCupNFT: React.FC = () => {
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const dispatch = useDispatch();

    const favoriteTeamDataQuery = useFavoriteTeamDataQuery(walletAddress, networkId);

    const favoriteTeamData =
        favoriteTeamDataQuery.isSuccess && favoriteTeamDataQuery.data ? favoriteTeamDataQuery.data : null;

    const [isChooseNFTOpen, setIsChooseNFTOpen] = useState<boolean>(!!favoriteTeamData?.favoriteTeam);

    const handleChooseNFT = useCallback(() => {
        setIsChooseNFTOpen(true);
    }, [setIsChooseNFTOpen]);

    useEffect(() => {
        dispatch(setTheme(Theme.WORLDCUP));
    }, [dispatch]);

    return (
        <>
            {favoriteTeamDataQuery.isLoading ? (
                <Loader />
            ) : (
                <>
                    <Container>
                        <Header />
                        {!favoriteTeamData?.isEligible && <NotEligible />}
                        {favoriteTeamData?.isEligible && !favoriteTeamData.favoriteTeam && !isChooseNFTOpen && (
                            <Eligible onChooseNft={handleChooseNFT} />
                        )}
                        {!!favoriteTeamData?.favoriteTeam && <AlreadyMinted />}
                        {isChooseNFTOpen && !favoriteTeamData?.favoriteTeam && favoriteTeamData?.isEligible && (
                            <ChooseNFT />
                        )}
                    </Container>
                    <SymbolsContainer>
                        <SymbolsBackground />
                    </SymbolsContainer>
                </>
            )}
        </>
    );
};

export default MintWorldCupNFT;
