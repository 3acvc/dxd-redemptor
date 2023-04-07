import styled from 'styled-components';
import { PrimaryButton as Button } from 'ui/components/Button';

export const CurrencyAmountInputInnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const TokenButton = styled(Button)(
  (props) => `
  font-size: 16px;
  padding: 8px 8px;
  background: transparent;
  &:hover {
    transform: none;
  }
  min-width: 100px;
  vertical-align: middle;
  ${props.disabled === false ? 'cursor: none !important;' : 'cursor: pointer;'}
`);
