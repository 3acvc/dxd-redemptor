import { WalletConnectButton } from "components/form/WalletConnectButton";
import { FormEventHandler, useEffect, useState } from "react";
import styled from "styled-components";
import { PrimaryButton } from "ui/components/Button";
import { useSignMessage } from "wagmi";
import { FormGroup } from "../components/FormGroup";
import { AGGREGATOR_URL } from "../constants";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
`;

export default function RegisterValidatorPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [endpoint, setEndpoint] = useState("");
  const [error, setError] = useState<Error | null>(null);
  const { signMessageAsync } = useSignMessage();

  const [registerationMessage, setRegisterationMessage] = useState();

  // fetch the registeration message
  useEffect(() => {
    fetch(`${AGGREGATOR_URL}/verifiers/message`)
      .then(async (response) => {
        const message = (await response.json()).data.message;
        setRegisterationMessage(message);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const onSubmitHandler: FormEventHandler = async (event) => {
    event.preventDefault();

    setError(null);

    try {
      if (!registerationMessage) throw new Error("No message found");

      setIsRegistering(true);

      // sign the message
      const signature = await signMessageAsync({
        message: registerationMessage,
      });

      const response = await fetch(`${AGGREGATOR_URL}/verifiers/register`, {
        method: "POST",
        body: JSON.stringify({
          endpoint,
          signature,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) alert("Verifier registered successfully");
      // reset form
      setEndpoint("");
    } catch (error) {
      setError(error as Error);
      console.log(error);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Container>
      <h1>Register Verifier Node</h1>
      <form onSubmit={onSubmitHandler}>
        <FormGroup>
          <label htmlFor="endpoint">Verifier Endpoint</label>
          <input
            disabled={isRegistering}
            type="url"
            id="endpoint"
            required
            value={endpoint}
            onChange={(event) => setEndpoint(event.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <WalletConnectButton>
            <PrimaryButton disabled={isRegistering} type="submit">
              Register
            </PrimaryButton>
          </WalletConnectButton>
        </FormGroup>
        {error && <p>{error.message}</p>}
      </form>
    </Container>
  );
}
