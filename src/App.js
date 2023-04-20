import React, { useState, useEffect } from "react";
import Web3 from "web3";
import EIP20Factory from "./EIP20Factory.json";
import "./App.css";
import Logo from "./logo.png"
function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [networkId, setNetworkId] = useState(null);
  const [factoryContract, setFactoryContract] = useState(null);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState("");
  const [supply, setSupply] = useState("");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        if (window.ethereum) {
          await window.ethereum.enable();
          const web3 = new Web3(window.ethereum);
          setWeb3(web3);
          const accounts = await web3.eth.getAccounts();
          setAccounts(accounts);
          const networkId = await web3.eth.net.getId();
          setNetworkId(networkId);
          const factoryAddress = '0xE076Eb51d8E7D54a29B59b8aeeFdBc701503458E';
          const factoryContract = new web3.eth.Contract(
            EIP20Factory.abi,
            factoryAddress
          );
          setFactoryContract(factoryContract);
        } else {
          setError("Please install MetaMask to use this dApp.");
        }
      } catch (e) {
        console.error(e);
      }
    };
    initWeb3();
  }, []);

  const handleCreateToken = async (e) => {
    e.preventDefault();
    try {
      const tokenName = name.trim();
      const tokenSymbol = symbol.trim();
      const tokenDecimals = parseInt(decimals);
      const tokenSupply = parseInt(supply);

      if (!tokenName || !tokenSymbol || isNaN(tokenDecimals) || isNaN(tokenSupply)) {
        setError("Please enter valid token details.");
        return;
      }

      await factoryContract.methods
        .createEIP20(tokenSupply, tokenName, tokenDecimals, tokenSymbol)
        .send({ from: accounts[0] })
        .on("transactionHash", (hash) => setTxHash(hash));

      setName("");
      setSymbol("");
      setDecimals("");
      setSupply("");
      setError("");
    } catch (e) {
      console.error(e);
    }
  };

  const connectWallet = async () => {
    try {
      await window.ethereum.enable();
      const web3 = new Web3(window.ethereum);
      setWeb3(web3);
      const accounts = await web3.eth.getAccounts();
      setAccounts(accounts);
      const networkId = await web3.eth.net.getId();
      setNetworkId(networkId);
      const factoryAddress = EIP20Factory.networks[networkId].address;
      const factoryContract = new web3.eth.Contract(
        EIP20Factory.abi,
        factoryAddress
      );
      setFactoryContract(factoryContract);
      setError("");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="App">
      <header>
          <div className="container">
            <h1 className="h1Style">Create your own token with BSC</h1>
            <span className="icon"><img src={Logo} alt="Logo" /></span>
          </div>
        {web3 && accounts.length > 0 ? (
          <p>Connected to <a className="scanStyle">{web3.utils.toChecksumAddress(accounts[0])}</a></p>
        ) : (
          <button onClick={connectWallet} className="walletButton">Connect Wallet</button>
        )}
      </header>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleCreateToken}>
        <label>
          Token Name:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Token Symbol:
          <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
        </label>
        <label>
          Decimals:
          <input type="text" value={decimals} onChange={(e) => setDecimals(e.target.value)} />
        </label>
        <label>
          Total Supply:
          <input type="text" value={supply} onChange={(e) => setSupply(e.target.value)} />
        </label>
        <button type="submit">Create Token</button>
      </form>
      {txHash && (
        <p>
          Token creation transaction submitted. View on{" "}
          <a href={`https://testnet.bscscan.com/tx/${txHash}`} target="_blank" rel="noreferrer">
            <p className="scanStyle">BSCScan</p>
          </a>
          .
        </p>
      )}
    </div>
  );
}

export default App;
