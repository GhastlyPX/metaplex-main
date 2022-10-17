import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import {clusterApiUrl, Connection, PublicKey} from "@solana/web3.js";
import {bundlrStorage, defaultCandyGuardProgram, Metaplex, Pda, sol, toBigNumber, toDateTime, toPublicKey} from "@metaplex-foundation/js"
import { walletAdapterIdentity } from "@metaplex-foundation/js";
import { useWallet } from '@solana/wallet-adapter-react';
import {MerkleTree} from "merkletreejs";
import {keccak_256} from "js-sha3";

const Home: NextPage = () => {

    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const wallet = useWallet();

    const metaplex = Metaplex.make(connection)
        .use(walletAdapterIdentity(wallet))
        .use(bundlrStorage());

    /*Const for mint func*/
    const candyID = toPublicKey('AcvrvkDSkvyJ7LQuUPdNqHjzcaXjXmwznxXPL5BDXcnn') /*Candy machine ID*/
    const collectionID = toPublicKey('49j4bQfo3LcVoHVkgGb3wbTFfVoepnugJ8aZeT8YXowJ')/*Collection ID*/
    const collectionUpdateAuth = toPublicKey('pphtbszzjSv6TPDGTJTrAsN1kmJQWF1GEoxySnWrRqW')/*Collection update authority*/
    const baseAccount = toPublicKey("64yNVV2NR6Lur31txL2T4beFv77RNAr4jYjjh3nZ8cf")/*Base account of candy guard*/
    const updateAuth = toPublicKey("pphtbszzjSv6TPDGTJTrAsN1kmJQWF1GEoxySnWrRqW") /*Wallet update authority*/
    const pda = new Pda("2K28AS9e9Bph3gv5JtYUDoYEJDs83ra3mBmxHyJhcRpd", 252) /*PDA Address derived from candy guard account*/
    const reciever = new PublicKey("pphtbszzjSv6TPDGTJTrAsN1kmJQWF1GEoxySnWrRqW") /*Wallet address of reciever*/
    /*End*/

    /*getting merkle root for allow list*/
    const allowlist = [
        "pphtbszzjSv6TPDGTJTrAsN1kmJQWF1GEoxySnWrRqW",
        "5GBUNyfyh8eQc63amfCcEWZe9xVyfnqGBSSc4SwmMTqz"
    ]

    const tree = new MerkleTree(allowlist.map(keccak_256), keccak_256, {sortPairs: true})
    const root = tree.getRoot()
    const proof = tree.getProof(Buffer.from(keccak_256("5GBUNyfyh8eQc63amfCcEWZe9xVyfnqGBSSc4SwmMTqzS")))
    console.log(root)
    /**/

    /*Minting works on auth wallet probably due to no cm date*/
    const mint = async () => {
        await metaplex
            .candyMachines()
            .mint({
                collectionUpdateAuthority: collectionUpdateAuth,
                candyMachine: {
                    address: candyID,
                    collectionMintAddress: collectionID,
                    candyGuard: {
                        model: "candyGuard",
                        address: pda,
                        authorityAddress: updateAuth,
                        baseAddress: baseAccount,
                        guards: {
                            botTax: { lamports: sol(0.01), lastInstruction: true },
                            solPayment: { amount: sol(0.5), destination: reciever },
                            tokenPayment: null,
                            startDate: { date: toDateTime('2021-10-10T18:00:00.000Z') },
                            thirdPartySigner: null,
                            tokenGate: null,
                            gatekeeper: null,
                            endDate: null,
                            allowList: {
                                merkleRoot: root,
                            },
                            mintLimit: null,
                            nftPayment: null,
                            redeemedAmount: null,
                            addressGate: null,
                            nftGate: null,
                            nftBurn: null,
                            tokenBurn: null,
                        },
                    },
                },
            })
    }
    /*Minting works if allowList is null on CM and on above function*/

    /*Attempt to use guard route for allow list*/
    const mint2 = async () => {
        await metaplex
            .candyMachines()
            .builders()
            .callGuardRoute(
                {
                    candyMachine: {
                        address: candyID,
                        candyGuard: {
                            model: "candyGuard",
                            address: pda,
                            authorityAddress: updateAuth,
                            baseAddress: baseAccount,
                            guards: {
                                botTax: { lamports: sol(0.01), lastInstruction: true },
                                solPayment: { amount: sol(0.5), destination: reciever },
                                tokenPayment: null,
                                startDate: { date: toDateTime('2021-10-10T18:00:00.000Z') },
                                thirdPartySigner: null,
                                tokenGate: null,
                                gatekeeper: null,
                                endDate: null,
                                allowList: {
                                    merkleRoot: root,
                                },
                                mintLimit: null,
                                nftPayment: null,
                                redeemedAmount: null,
                                addressGate: null,
                                nftGate: null,
                                nftBurn: null,
                                tokenBurn: null,
                            },
                        }
                    },
                    group: undefined,
                    guard: 'allowList',
                    settings: {
                        path: "proof",
                        merkleProof: proof,
                    },
                }
            )
    }
    /*End*/

  return (
    <div className={styles.container}>
        <WalletMultiButton />
        <button onClick={mint2}>mint</button>
    </div>
  )
}

export default Home
