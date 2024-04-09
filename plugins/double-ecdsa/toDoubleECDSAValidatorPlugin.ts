import { KERNEL_ADDRESSES } from "@zerodev/sdk"
import type { KernelValidator } from "@zerodev/sdk/types"
import type { TypedData } from "abitype"
import * as ethers from "ethers"
import { type UserOperation, getUserOperationHash } from "permissionless"
import {
    SignTransactionNotSupportedBySmartAccount,
    type SmartAccountSigner
} from "permissionless/accounts"
import {
    type Address,
    type Chain,
    type Client,
    type Hex,
    type LocalAccount,
    type Transport,
    type TypedDataDefinition,
    encodeAbiParameters
} from "viem"
import { privateKeyToAccount, toAccount } from "viem/accounts"
import { signMessage, signTypedData } from "viem/actions"
import { getChainId } from "viem/actions"
import { DOUBLE_ECDSA_VALIDATOR_ADDRESS } from "./index.js"

export type Bytes4 = string & {
    length: 6
}

export async function signerToDoubleEcdsaValidator<
    TTransport extends Transport = Transport,
    TChain extends Chain | undefined = Chain | undefined,
    TSource extends string = "custom",
    TAddress extends Address = Address
>(
    client: Client<TTransport, TChain, undefined>,
    {
        signer,
        entryPoint = KERNEL_ADDRESSES.ENTRYPOINT_V0_6,
        validatorAddress = DOUBLE_ECDSA_VALIDATOR_ADDRESS
    }: {
        signer: SmartAccountSigner<TSource, TAddress>
        entryPoint?: Address
        validatorAddress?: Address
    },
    proofHash: string,
    model_id: Bytes4,
    version_id: Bytes4,
    proof_id: string
): Promise<KernelValidator<"DoubleECDSAValidator">> {
    // Get the private key related account
    const viemSigner: LocalAccount = {
        ...signer,
        signTransaction: (_, __) => {
            throw new SignTransactionNotSupportedBySmartAccount()
        }
    } as LocalAccount

    // Create Owner signer that signs the data within the sdk
    // .env breaking
    const privateKey =
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    console.log("privateKey", privateKey)

    if (!privateKey) {
        throw new Error("Private key not defined")
    }

    const dataSigner = privateKeyToAccount(privateKey as "0x${string}")

    // Fetch chain id
    const chainId = await getChainId(client)

    // Build the EOA Signer
    const account = toAccount({
        address: viemSigner.address,
        async signMessage({ message }) {
            return signMessage(client, { account: viemSigner, message })
        },
        async signTransaction(_, __) {
            throw new SignTransactionNotSupportedBySmartAccount()
        },
        async signTypedData<
            const TTypedData extends TypedData | Record<string, unknown>,
            TPrimaryType extends
                | keyof TTypedData
                | "EIP712Domain" = keyof TTypedData
        >(typedData: TypedDataDefinition<TTypedData, TPrimaryType>) {
            return signTypedData<TTypedData, TPrimaryType, TChain, undefined>(
                client,
                {
                    account: viemSigner,
                    ...typedData
                }
            )
        }
    })

    return {
        ...account,
        address: validatorAddress,
        source: "DoubleECDSAValidator",

        async getEnableData() {
            const modelIdBytes = ethers.utils.hexZeroPad(
                ethers.BigNumber.from(model_id).toHexString(),
                16
            )

            return encodeAbiParameters(
                [{ name: "modelId", type: "bytes16" }],
                [modelIdBytes as "0x${string}"]
            )
        },
        async getNonceKey() {
            return 0n
        },
        // Sign a user operation
        async signUserOperation(userOperation: UserOperation) {
            const proofId =
                "0x3838383838383838383838383838383838383838383838383838383838383838"
            const proofHash =
                "0x501f55d0452337c3c5f76391d181c1d9008c7550b826c806abea9ad3365a2747"
            const sig1 =
                "0xe0e5970d056dfb379b13b9dff8ee428c5f5d186112b557ac20b484e66e14d6995a5667ac74ff0f485aecd16c2a5e4c13ee5d3db551528651a7bf5b877e2c9e771c"
            const sig2 =
                "0x6a363ef5ba228d4a00c0b736b36672e0b846048acedee0e75c90027c026e2fa703ca96a9050f6be84aabcd951b759a0f8b173414f8f7019396739b6671410c1f1c"
            const sig = `${sig1.slice(2)}${sig2.slice(2)}${proofId.slice(
                2
            )}${proofHash.slice(2)}`
            console.log("Signature: ", sig)

            const hash = getUserOperationHash({
                userOperation: {
                    ...userOperation,
                    signature: sig as `0x${string}`
                },
                entryPoint: entryPoint,
                chainId: chainId
            })
            console.log("hash", hash)

            return `0x${sig}`
        },

        // Get simple dummy signature
        async getDummySignature() {
            return "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c"
        },

        async isEnabled(
            _kernelAccountAddress: Address,
            _selector: Hex
        ): Promise<boolean> {
            return false
        }
    }
}
