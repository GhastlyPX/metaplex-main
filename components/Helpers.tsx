import { TokenStandard } from '@metaplex-foundation/mpl-token-metadata';
import { sha512 } from '@noble/hashes/sha512';
import spok, { Specifications } from 'spok';
import { replaceCandyMachineItemPattern } from '@metaplex-foundation/js/src/plugins/candyMachineModule/models/CandyMachineHiddenSection';
import {
    CandyMachine,
    CandyMachineConfigLineSettings,
    CandyMachineItem,
    CreateCandyGuardInput,
    CreateCandyMachineInput, CreateNftInput,
    isSigner,
    Metaplex,
    NftWithToken,
    PublicKey,
    toBigNumber,
    token, UploadMetadataInput,
} from '@metaplex-foundation/js';

export const createCollectionNft = (
    mx: Metaplex,
    input: Partial<CreateNftInput & { json: UploadMetadataInput }> = {}
) => createNft(mx, { ...input, isCollection: true });

export const createNft = async (
    mx: Metaplex,
    input: Partial<CreateNftInput & { json: UploadMetadataInput }> = {}
) => {
    const { uri } = await mx.nfts().uploadMetadata(input.json ?? {});
    const { nft } = await mx.nfts().create({
        uri,
        name: 'My NFT',
        sellerFeeBasisPoints: 200,
        ...input,
    });

    return nft;
};

export const SEQUENTIAL_ITEM_SETTINGS: CandyMachineConfigLineSettings = {
    type: 'configLines',
    prefixName: '',
    nameLength: 32,
    prefixUri: '',
    uriLength: 200,
    isSequential: true,
};

export const createCandyMachine = async (
    metaplex: Metaplex,
    input?: Partial<CreateCandyMachineInput> & {
        items?: Pick<CandyMachineItem, 'name' | 'uri'>[];
    }
) => {
    let collection;
    if (input?.collection) {
        collection = input.collection;
    } else {
        const nft = await createCollectionNft(metaplex);
        collection = { address: nft.address, updateAuthority: metaplex.identity() };
    }

    let { candyMachine } = await metaplex.candyMachines().create({
        collection,
        sellerFeeBasisPoints: 200,
        itemsAvailable: toBigNumber(1000),
        ...input,
    });

    if (input?.items) {
        await metaplex.candyMachines().insertItems({
            candyMachine,
            authority:
                input.authority && isSigner(input.authority)
                    ? input.authority
                    : metaplex.identity(),
            items: input.items,
        });
        candyMachine = await metaplex.candyMachines().refresh(candyMachine);
    }

    return { candyMachine, collection };
};

export const createCandyGuard = async (
    metaplex: Metaplex,
    input?: Partial<CreateCandyGuardInput>
) => {
    const { candyGuard } = await metaplex
        .candyMachines()
        .createCandyGuard({ guards: {}, ...input });

    return candyGuard;
};

export function create32BitsHash(
    input: Buffer | string,
    slice?: number
): number[] {
    const hash = create32BitsHashString(input, slice);

    return Buffer.from(hash, 'utf8').toJSON().data;
}

export function create32BitsHashString(
    input: Buffer | string,
    slice = 32
): string {
    const hash = sha512(input).slice(0, slice / 2);

    return Buffer.from(hash).toString('hex');
}

