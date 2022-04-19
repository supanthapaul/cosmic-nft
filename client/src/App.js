import './styles/App.css';
import './styles/output.css'
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from "react";
import { ethers } from 'ethers';
import CosmicNFT from './utils/CosmicNFT.json';
import Spinner from './components/Spinner'
import NftPreview from './components/NftPreview';

// Constants
const TWITTER_HANDLE = 'supanthapaul';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const CONTRACT_ADDRESS = "0x1697594CfB70874837424a16Ae5f93508679E223";
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;

const App = () => {

	const [currentAccount, setCurrentAccount] = useState("");
	// client-side fix for https://github.com/ethers-io/ethers.js/issues/2310
	const [nftMintedinCurrentSession, setNftMintedinCurrentSession] = useState(false);
	const [nftMetadata, setNftMetadata] = useState(null);
	const [nftLink, setNftLink] = useState(null);
	const [mining, setMining] = useState(false);


	const checkIfWalletIsConnected = async () => {
		const { ethereum } = window;

		if (!ethereum) {
			console.log("Make sure you have metamask!");
			return;
		} else {
			console.log("We have the ethereum object", ethereum);
		}

		// Check if we're authorized to access the user's wallet
		const accounts = await ethereum.request({ method: 'eth_accounts' });

		// User can have multiple authorized accounts, we grab the first one
		if (accounts.length !== 0) {
			const account = accounts[0];
			console.log("Found an authorized account:", account);
			setCurrentAccount(account);
			// setup event listener for minting completion
			//setupEventListener();
		} else {
			console.log("No authorized account found");
		}
	}

	const connectWallet = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert("Get MetaMask!");
				return;
			}

			// method to request access to account.
			const accounts = await ethereum.request({ method: "eth_requestAccounts" });

			console.log("Connected", accounts[0]);
			setCurrentAccount(accounts[0]);
			// setup event listener for minting completion
			//setupEventListener();
		} catch (error) {
			console.log(error);
		}
	}

	const tryMintNft = async () => {

		try {
			const { ethereum } = window;

			if (ethereum) {
				// we are tring to mint a nft this session
				setNftMintedinCurrentSession(true);

				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, CosmicNFT.abi, signer);

				let nftTxn = await connectedContract.makeACosmicNFT();

				console.log(`Mining, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`)
				setMining(true);
				await nftTxn.wait();

				console.log(`Mined!`);
				setMining(false);
				
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error)
		}
	}

	// Render Methods
	const renderNotConnectedContainer = () => (
		<button onClick={connectWallet} className="cta-button connect-wallet-button">
			Connect to Wallet
		</button>
	);

	useEffect(() => {
		checkIfWalletIsConnected();
		//setupEventListener();
		// let chainId = await ethereum.request({ method: 'eth_chainId' });
		// console.log("Connected to chain " + chainId);

		// // String, hex code of the chainId of the Rinkebey test network
		// const rinkebyChainId = "0x4"; 
		// if (chainId !== rinkebyChainId) {
		// 	alert("You are not connected to the Rinkeby Test Network!");
		// }
	}, [])

	useEffect(() => {
		let connectedContract;
		const OnNewCosmicNFTMinted = (from, tokenId, metadata) => {
			//if(!nftMintedinCurrentSession) return;
			console.log(from, tokenId.toNumber());
			console.log(metadata);
			setNftMetadata(metadata);
			setNftLink(`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`);
			//alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
		};

		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				connectedContract = new ethers.Contract(CONTRACT_ADDRESS, CosmicNFT.abi, signer);

				connectedContract.on("NewCosmicNFTMinted", OnNewCosmicNFTMinted);

				console.log("Setup event listener!")

			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error)
		}

		return () => {
			if(connectedContract) {
				connectedContract.off("NewCosmicNFTMinted", OnNewCosmicNFTMinted);
			}
		}
	}, [])

	return (
		<div className="App">
			<div className="main-container">
				<div className="header-container">
					<p className="header gradient-text">Cosmic NFT</p>
					<p className="sub-text">
						Each unique. Each beautiful. Discover your NFT today.
					</p>
					{!currentAccount ?
						renderNotConnectedContainer() :
						<button onClick={tryMintNft} disabled={mining} className="cta-button connect-wallet-button">
							{mining ? <Spinner /> : "Mint a Cosmic NFT"}
							
						</button>}
				</div>
				{nftMintedinCurrentSession && nftMetadata &&  <NftPreview nftMetadata={nftMetadata} nftLink={nftLink}/>}
				<div className="footer-container">
					<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
					<a
						className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noreferrer"
					>{`built by @${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	);
};

export default App;
