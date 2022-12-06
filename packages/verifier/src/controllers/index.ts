import { badRequest } from '@hapi/boom';
import { captureException } from '@sentry/node';
import { Wallet } from 'ethers';

import { getDXDCirculatingSupply } from '../../dxdao';
import { ChainId } from '../../lib/web3';
import { getDXDRedemptorContract } from '../../redemptor-contract';

import { IVerifyAndSignOracleAggreagatorMessageRequest } from './types';

/**
 * Verifies and signs a message from the oracle aggregator
 */
export async function verifyAndSignOracleAggreagatorMessageController(
  req: IVerifyAndSignOracleAggreagatorMessageRequest
): Promise<{
  data: {
    signature: string;
  };
}> {
  // get all signers from the database and then compare them agaisnt the redemer contract
  try {
    const { blockNumber, message: aggregatorMessage } = req.payload;

    const responseBody = {
      data: {
        signature: '',
      },
    };

    // For value,s verify that the message is correct
    const expectedDXDCirculatingSupply = await getDXDCirculatingSupply(
      blockNumber
    );

    if (
      !expectedDXDCirculatingSupply.eq(
        await aggregatorMessage.circulatingDXDSupply
      )
    ) {
      throw Error(
        `DXD circulating supply is not valid. Expected ${expectedDXDCirculatingSupply} but got ${aggregatorMessage.circulatingDXDSupply} from the aggregator`
      );
    }

    // Construst the signer from the private key
    const signer = new Wallet(process.env.SIGNER_PRIVATE_KEY as string);

    const redemptor = getDXDRedemptorContract();

    // When the message is correct, sign it and return the signature
    responseBody.data.signature = await signer._signTypedData(
      {
        name: 'DXD redemptor',
        version: '1',
        chainId: ChainId.Ethereum,
        verifyingContract: redemptor.address,
      },
      {
        oracleMessage: [
          { name: 'redeemedDXD', type: 'uint256' },
          { name: 'circulatingDXDSupply', type: 'uint256' },
          { name: 'redeemedToken', type: 'address' },
          { name: 'redeemedTokenUSDPrice', type: 'uint256' },
          { name: 'redeemedAmount', type: 'uint256' },
          { name: 'collateralUSDValue', type: 'uint256' },
        ],
      },
      aggregatorMessage // Sign the same message from the aggregator node
    );

    return responseBody;
  } catch (error) {
    console.error(error);
    captureException(error);

    if (error.isBoom) {
      throw error;
    }

    throw badRequest(error);
  }
}

