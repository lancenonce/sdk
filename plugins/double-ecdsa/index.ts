import type { KernelValidator } from "@zerodev/sdk"
import {
    type Bytes4,
    enableDoubleEcdsaValidator
} from "./enableDoubleECDSAValidator.js"
import { signerToDoubleEcdsaValidator } from "./toDoubleECDSAValidatorPlugin.js"

export {
    enableDoubleEcdsaValidator,
    type Bytes4,
    signerToDoubleEcdsaValidator,
    type KernelValidator
}

export const DOUBLE_ECDSA_VALIDATOR_ADDRESS =
    "0x2Eab39C3bf3aD43C7c14Be447D8e11a6b51D0f95"
