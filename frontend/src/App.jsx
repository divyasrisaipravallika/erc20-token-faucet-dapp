import { useEffect, useState } from "react";

function App() {
  const [address, setAddress] = useState(null);

  async function connectWallet() {
    if (!window.ethereum) {
      alert("MetaMask not found");
      return;
    }
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAddress(accounts[0]);
  }

  function disconnectWallet() {
    setAddress(null);
  }

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAddress(accounts.length ? accounts[0] : null);
      });
    }
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>ERC-20 Token Faucet</h2>

      {address ? (
        <>
          <p><b>Connected:</b> {address}</p>
          <button onClick={disconnectWallet}>Disconnect</button>
        </>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}

export default App;

