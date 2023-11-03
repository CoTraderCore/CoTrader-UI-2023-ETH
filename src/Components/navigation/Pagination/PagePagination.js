import React from 'react';
import { Button, HStack, Text, useColorModeValue } from '@chakra-ui/react';
import isMobile from '../../../utils/isMobile';
import { inject, observer } from 'mobx-react';


const PagePagination = ({ currentPage, setCurrentPage,MobXStorage }) => {
  const colorScheme = useColorModeValue("blue","blue")
  // const [currentPage, setCurrentPage] = useState(1);
  const perPage = isMobile() ? 5 : 10;
  const isMobileDevice = isMobile();

  const paginationClick = (event) => {
    const selectedPage = Number(event.target.id);
    setCurrentPage(selectedPage);
    MobXStorage?.paginationChange(paginationCalculate(selectedPage));
  };

  const paginationStep = (step) => {
    const newPage = step === 1 ? currentPage + 1 : currentPage - 1;
    setCurrentPage(newPage);
    MobXStorage?.paginationChange(paginationCalculate(newPage));
  };

  const calculatePageNumbers = () => {
    const totalSmartFunds = MobXStorage?.SmartFundsOriginal.length;
    const totalPages = Math.ceil(totalSmartFunds / perPage);
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  };

  const paginationCalculate = (current) => {
    const indexOfLastItem = current * perPage;
    const indexOfFirstItem = indexOfLastItem - perPage;
    return MobXStorage?.SmartFundsOriginal.slice(indexOfFirstItem, indexOfLastItem);
  };

  const pageNumbers = calculatePageNumbers();

  const renderPageNumbers = pageNumbers.map((number) => (
    <Button
      size="sm"
      key={number}
      variant={number === currentPage ? 'solid' : 'outline'}
      colorScheme={colorScheme}
      onClick={paginationClick}
      id={number}
    >
      {number}
    </Button>
  ));

  return (
    <HStack mt={5}>
      {isMobileDevice ? (
        <React.Fragment>{renderPageNumbers}</React.Fragment>
      ) : (
        <React.Fragment>
          {currentPage !== 1 && (
            <Button onClick={() => paginationStep(0)}>Previous</Button>
          )}
          {renderPageNumbers.slice(0, 2)}
          <Text>...</Text>
          {renderPageNumbers.slice(-2)}
          {currentPage !== pageNumbers.length && (
            <Button onClick={() => paginationStep(1)}>Next</Button>
          )}
        </React.Fragment>
      )}
     
    </HStack>
  );
};

export default inject('MobXStorage')(observer(PagePagination));


