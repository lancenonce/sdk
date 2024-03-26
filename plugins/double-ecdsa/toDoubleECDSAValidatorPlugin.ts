import { KERNEL_ADDRESSES } from "@zerodev/sdk";
import type { KernelValidator } from "@zerodev/sdk/types";
import type { TypedData } from "abitype";
import { type UserOperation, getUserOperationHash } from "permissionless";
import {
  SignTransactionNotSupportedBySmartAccount,
  type SmartAccountSigner,
} from "permissionless/accounts";
import {
  type Address,
  type Chain,
  type Client,
  type Hex,
  type LocalAccount,
  type Transport,
  type TypedDataDefinition,
  encodeAbiParameters,
} from "viem";
import { privateKeyToAccount, toAccount } from "viem/accounts";
import { signMessage, signTypedData } from "viem/actions";
import { getChainId } from "viem/actions";
import { DOUBLE_ECDSA_VALIDATOR_ADDRESS } from "./index.js";
import * as ethers from "ethers";

export type Bytes4 = string & {
  length: 6;
};

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
    validatorAddress = DOUBLE_ECDSA_VALIDATOR_ADDRESS,
  }: {
    signer: SmartAccountSigner<TSource, TAddress>;
    entryPoint?: Address;
    validatorAddress?: Address;
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
      throw new SignTransactionNotSupportedBySmartAccount();
    },
  } as LocalAccount;

  // Create Owner signer that signs the data within the sdk
  // .env breaking
  const privateKey =
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  console.log("privateKey", privateKey);

  if (!privateKey) {
    throw new Error("Private key not defined");
  }

  const dataSigner = privateKeyToAccount(privateKey as "0x${string}");

  // Fetch chain id
  const chainId = await getChainId(client);

  // Build the EOA Signer
  const account = toAccount({
    address: viemSigner.address,
    async signMessage({ message }) {
      return signMessage(client, { account: viemSigner, message });
    },
    async signTransaction(_, __) {
      throw new SignTransactionNotSupportedBySmartAccount();
    },
    async signTypedData<
      const TTypedData extends TypedData | Record<string, unknown>,
      TPrimaryType extends keyof TTypedData | "EIP712Domain" = keyof TTypedData
    >(typedData: TypedDataDefinition<TTypedData, TPrimaryType>) {
      return signTypedData<TTypedData, TPrimaryType, TChain, undefined>(
        client,
        {
          account: viemSigner,
          ...typedData,
        }
      );
    },
  });

  return {
    ...account,
    address: validatorAddress,
    source: "DoubleECDSAValidator",

    async getEnableData() {
      const proofIdBytes = ethers.utils.hexZeroPad(
        ethers.BigNumber.from(proof_id).toHexString(),
        32
      );
      const modelIdBytes = ethers.utils.hexZeroPad(
        ethers.BigNumber.from(model_id).toHexString(),
        16
      );
      const versionIdBytes = ethers.utils.hexZeroPad(
        ethers.BigNumber.from(version_id).toHexString(),
        16
      );
      const proofHashBytes = ethers.utils.hexZeroPad(proofHash, 32);

      return encodeAbiParameters(
        [
          { name: "proofId", type: "bytes32" },
          { name: "modelId", type: "bytes16" },
          { name: "versionId", type: "bytes16" },
          { name: "proofHash", type: "bytes32" },
        ],
        [proofIdBytes as "0x${string}", modelIdBytes as "0x${string}", versionIdBytes as "0x${string}", proofHashBytes as "0x${string}"]
      );
    },
    async getNonceKey() {
      return 0n;
    },
    // Sign a user operation
    async signUserOperation(userOperation: UserOperation) {
      const signer1Sig = await signMessage(client, {
        account: viemSigner,
        message: { raw: proofHash as `0x${string}` },
      });
      const signer2Sig = await dataSigner.signMessage({
        message: proofHash,
      });
      const concatenatedSig = signer1Sig.slice(0, 64) + signer2Sig.slice(2);
      console.log("concatenatedSig", concatenatedSig);

      const hash = getUserOperationHash({
        userOperation: {
          ...userOperation,
          signature: concatenatedSig as `0x${string}`,
        },
        entryPoint: entryPoint,
        chainId: chainId,
      });
      console.log("hash", hash);

      return `0x${concatenatedSig}`;
    },

    // Get simple dummy signature
    async getDummySignature() {
      return "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";
    },

    async isEnabled(
      _kernelAccountAddress: Address,
      _selector: Hex
    ): Promise<boolean> {
      return false;
    },
  };
}
