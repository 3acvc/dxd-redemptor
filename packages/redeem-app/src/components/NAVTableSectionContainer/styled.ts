import styled from "styled-components";

export const MetricListContainer = styled.div`
    display: flex;
    gap: 10px;
    margin-bottom: 15px;

    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 15px;
    align-items: stretch;

    @media (min-width: 768px) {
        flex-direction: row;

        & > div {
            flex: 1;
        }
    }

`;

export const Metric = styled.div`
    background-color: #fff;
    border: 1px solid #000;
    border-radius: 3px;
    padding: 10px;
    text-align: center;
    min-height: 100px;
`;

export const MetricInnerLayout = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    height: 100%;
`;

export const NAVTableSection = styled.div`
    background-color: #fff;
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
        background-color: #fff;
    }

    & thead > tr > th:first-child {
        position: sticky;
        top: 0;
        left: 0;
        z-index: 1;
        background-color: #fff;
    }
    & tbody > tr > th:first-child {
        position: sticky;
        left: 0;
        z-index: 2;
    }
`;
