import { useDispatch, useSelector } from 'react-redux';
import { getSportFilter, getTagFilter, setTagFilter } from 'redux/modules/market';
import { RootState } from 'redux/rootReducer';
import { Breadcrumb, BreadcrumbsContainer } from './styled-components';

const Breadcrumbs: React.FC = () => {
    const dispatch = useDispatch();
    const sportFilter = useSelector((state: RootState) => getSportFilter(state));
    const tagFilter = useSelector((state: RootState) => getTagFilter(state));

    return (
        <BreadcrumbsContainer>
            <Breadcrumb onClick={() => dispatch(setTagFilter([]))}>{sportFilter}</Breadcrumb>

            {!!tagFilter.length &&
                tagFilter.map((tag, index) => {
                    return (
                        <>
                            {index === 0 ? ' / ' : ''}
                            <Breadcrumb onClick={() => dispatch(setTagFilter([tag]))} key={tag.label}>
                                {tag.label}
                            </Breadcrumb>
                            {index === tagFilter.length - 1 ? '' : ', '}
                        </>
                    );
                })}
        </BreadcrumbsContainer>
    );
};

export default Breadcrumbs;
