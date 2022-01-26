import Head from 'next/head';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Oval } from 'react-loader-spinner';
import abiObject from '../utils/WavePortal.json';

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState('');
  const [isMining, setIsMining] = useState(false);

  // Not sure if I have the correct address here.
  const contractAddress = '0x1dFd3131197c1f454a318D2f6D55F56e23ACde2b';
  const contractABI = abiObject.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have metamask!');
        return;
      } else {
        console.log('We have the ethereum object', ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account:', account);
        setCurrentAccount(account);
      } else {
        console.log('No authorized account found');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        console.log('Retrieved total wave count...', count.toNumber());

        await setIsMining(true);

        const waveTxn = await wavePortalContract.wave();
        console.log('Mining...', waveTxn.hash);

        await waveTxn.wait();
        console.log('Mined -- ', waveTxn.hash);

        await setIsMining(false);

        count = await wavePortalContract.getTotalWaves();
        console.log('Retrieved new total wave count...', count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Ethereum wave app</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <div className="flex w-2/3 justify-end mb-10">
          {!currentAccount && (
            <button
              className="mt-5 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
              onClick={connectWallet}
            >
              Connect Wallet
            </button>
          )}
          {currentAccount && (
            <div>
              <p>You are connected 🎉</p>
              <p>{currentAccount}</p>
            </div>
          )}
        </div>

        <h1 className="text-6xl font-bold">Welcome</h1>

        <div>👋 Hey there!</div>

        <div className="mt-5 text-justify">
          Connect your Ethereum wallet and wave at me!
        </div>

        {isMining ? (
          <div className="d-flex flex-col justify-center mt-8">
            <div className="flex justify-center">
              <Oval
                ariaLabel="loading-indicator"
                height={100}
                width={100}
                strokeWidth={5}
                strokeWidthSecondary={1}
                color="blue"
                secondaryColor="white"
              />
            </div>
            <p className="mt-5 font-bold text-center">
              Currently mining your transaction...
            </p>
          </div>
        ) : currentAccount ? (
          <button
            className="mt-8 -5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
            onClick={wave}
          >
            Wave at Me
          </button>
        ) : (
          <p>Please connect your wallet</p>
        )}
      </main>

      <footer className="flex items-center justify-center w-full h-24 border-t">
        <a
          className="flex items-center justify-center"
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel Logo" className="h-4 ml-2" />
        </a>
      </footer>
    </div>
  );
}
