import {bundlrStorage, Metaplex, toPublicKey, walletAdapterIdentity} from "@metaplex-foundation/js";
import {clusterApiUrl, Connection} from "@solana/web3.js";
import {useWallet} from "@solana/wallet-adapter-react";

async function Fetcher() {
    const ass = toPublicKey('Ebzce5SdUADYAztuc85qRy4sxCDZp4fxxdSKu22EGhMJ')
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const wallet = useWallet();

    const metaplex = Metaplex.make(connection)
        .use(walletAdapterIdentity(wallet))
        .use(bundlrStorage());

    const candyMachine = await metaplex
        .candyMachines()
        .findByAddress({address: ass});
    console.log(candyMachine)
}

export default Fetcher
