import React, { useEffect, useState } from "react";
import {
  CONTRACT_ADDRESSES,
  getProvider,
  getSigner,
  getTokenContract,
  getFaucetContract,
} from "./utils/contracts";
import { ethers } from "ethers";
if (window.location.pathname === "/health") {
  document.body.innerText = "OK";
}


function App() {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState("0");
  const [canClaim, setCanClaim] = useState(false);
  const [remaining, setRemaining] = useState("0");
  const [loading, setLoading] = useState(false);

  async function connectWallet() {
    if (!window.ethereum) throw new Error("Wallet not found");
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAddress(accounts[0]);
    return accounts[0];
  }

  async function refreshState(addr) {
    if (!addr) return;

    const token = await getTokenContract();
    const faucet = await getFaucetContract();

    const bal = await token.balanceOf(addr);
    const can = await faucet.canClaim(addr);
    const rem = await faucet.remainingAllowance(addr);

    setBalance(bal.toString());
    setCanClaim(can);
    setRemaining(rem.toString());
  }

  async function requestTokens() {
    setLoading(true);
    try {
      const faucet = await getFaucetContract(true);
      const tx = await faucet.requestTokens();
      await tx.wait();
      await refreshState(address);
      return tx.hash;
    } catch (err) {
      throw new Error(err.reason || err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (address) {
      refreshState(address);
    }
  }, [address]);

  // =========================
  // 🔴 REQUIRED EVAL INTERFACE
  // =========================
  window.__EVAL__ = {
    connectWallet: async () => {
      return await connectWallet();
    },

    requestTokens: async () => {
      if (!address) throw new Error("Wallet not connected");
      return await requestTokens();
    },

    getBalance: async (addr) => {
      const token = await getTokenContract();
      const bal = await token.balanceOf(addr);
      return bal.toString();
    },

    canClaim: async (addr) => {
      const faucet = await getFaucetContract();
      return await faucet.canClaim(addr);
    },

    getRemainingAllowance: async (addr) => {
      const faucet = await getFaucetContract();
      const rem = await faucet.remainingAllowance(addr);
      return rem.toString();
    },

    getContractAddresses: async () => {
      return CONTRACT_ADDRESSES;
    },
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>ERC-20 Faucet DApp</h2>

      {address ? (
        <>
          <p><b>Address:</b> {address}</p>
          <p><b>Balance:</b> {balance}</p>
          <p><b>Can Claim:</b> {canClaim ? "Yes" : "No"}</p>
          <p><b>Remaining Allowance:</b> {remaining}</p>

          <button onClick={requestTokens} disabled={!canClaim || loading}>
            {loading ? "Processing..." : "Request Tokens"}
          </button>
        </>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}

export default App;
