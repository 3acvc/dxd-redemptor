import { LeanDocument } from 'mongoose';

import { getDXDRedemptorContract } from '../redemptor-contract';

import { OracleSignerDocument, OracleSignerModel } from './models/Signer.model';

type VerifiedOralceSigner = LeanDocument<OracleSignerDocument> & {
  isSigner: boolean;
};

/**
 * Returns the list of oracle signers.
 */
export async function getVerifiedOracleSigners(): Promise<
  VerifiedOralceSigner[]
> {
  const oracleSignerFromDBList = await OracleSignerModel.find().lean();

  const oracleSignerList: VerifiedOralceSigner[] = await Promise.all(
    oracleSignerFromDBList.map(async signer => {
      const isSigner = await getDXDRedemptorContract().isSigner(signer.address);

      return {
        ...signer,
        isSigner,
      };
    })
  ).then(signers => signers.filter(signer => signer));

  return oracleSignerList;
}

