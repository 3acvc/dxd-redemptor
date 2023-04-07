import styled from "styled-components";
import { backgroundColorDark as backgroundColor } from "ui/components/base/constants";

type Columns =number | string;
const gap = 16

export const MetricListContainer = styled.div<{
  $mdColumns: Columns;
  $lgColumns: Columns;
  $mdRows: Columns;
  $lgRows: Columns;
}>(
  (props) => `
  display: flex;
  gap: ${gap}px;
  margin-bottom: 16px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  align-items: stretch;
  & > div {
    flex: 1;
  }
  @media (min-width: 576px) {
    display: grid;
    grid-template-columns: ${isNaN(props.$mdColumns as any) ? props.$mdColumns : `repeat(${props.$mdColumns}, 1fr);` };
    grid-template-rows: repeat(${props.$mdRows}, 1fr);
    grid-gap: ${gap}px;
  }
  @media (min-width: 1024px) {
    grid-template-columns: ${isNaN(props.$lgColumns as any) ? props.$lgColumns : `repeat(${props.$lgColumns}, 1fr);` };
    grid-template-rows: repeat(${props.$lgRows}, 1fr);
  }
`
);

export const NAVTableSection = styled.div`
  ${backgroundColor}
  margin-bottom: 15px;
`;

export const TokenInfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-end;
`;

export const NAVTable = styled.table`
  width: 100%;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;

  caption {
    text-align: left;
    padding: 0.25rem;
    font-weight: bold;
    position: sticky;
    left: 0;
  }

  & th {
    ${backgroundColor}
    text-align: left;
  }

  & thead > tr > th:first-child {
    position: sticky;
    top: 0;
    left: 0;
    z-index: 1;
    ${backgroundColor}
  }
  & tbody > tr > th:first-child {
    position: sticky;
    left: 0;
    z-index: 2;
  }
`;
