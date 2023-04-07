import styled from "styled-components";

type FormGroupProps = {
  id?: string;
  children: React.ReactNode;
};

export function FormGroup({ children, ...props }: FormGroupProps) {
  return <StyledFromGroup {...props}>{children}</StyledFromGroup>;
}

const StyledFromGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
`;

/**
 * Use this component to group buttons together
 */
export const FormButtonGroup = styled(StyledFromGroup)`
  margin: 20px 0;
  align-items: center;
`;
