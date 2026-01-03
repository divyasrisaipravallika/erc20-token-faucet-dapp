import { ethers } from "ethers";

/**
 * These values MUST be configurable via env in production.
 * For now, placeholders are fine.
 */
export const CONTRACT_ADDRESSES = {
  token: import.meta.env.VITE_TOKEN_ADDRESS || "",
  faucet: import.meta.env.VITE_FAUCET_ADDRESS || "",
};

export const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

export const FAUCET_ABI = [
  "function requestTokens()",
  "function canClaim(address) view returns (bool)",
  "function remainingAllowance(address) view returns (uint256)",
  "function isPaused() view returns (bool)",
];

export function getProvider() {
  if (!window.ethereum) {
    throw new Error("Wallet not found");
  }
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = getProvider();
  return provider.getSigner();
}

export async function getTokenContract() {
  const provider = getProvider();
  return new ethers.Contract(
    CONTRACT_ADDRESSES.token,
    TOKEN_ABI,
    provider
  );
}

export async function getFaucetContract(withSigner = false) {
  const provider = getProvider();
  if (withSigner) {
    const signer = await provider.getSigner();
    return new ethers.Contract(
      CONTRACT_ADDRESSES.faucet,
      FAUCET_ABI,
      signer
    );
  }
  return new ethers.Contract(
    CONTRACT_ADDRESSES.faucet,
    FAUCET_ABI,
    provider
  );
}

