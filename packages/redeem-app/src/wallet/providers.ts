import { ChainProviderFn } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';

export const ALCHEMY_KEY = process.env.REACT_APP_ALCHEMY_KEY;

if (!ALCHEMY_KEY) {
  throw new Error('Missing REACT_APP_ALCHEMY_KEY');
}


export const alchemy = alchemyProvider({ apiKey: ALCHEMY_KEY, priority: 1 });

export const providers: ChainProviderFn[] = [alchemy];
