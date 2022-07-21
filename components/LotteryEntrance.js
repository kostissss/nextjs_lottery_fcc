import { useEffect, useState } from "react";
const { abi, contractAddresses } = require("../constants");
import { useMoralis } from "react-moralis";
import { useWeb3Contract } from "react-moralis";
import { ethers } from "ethers";
import { useNotification } from "web3uikit";

export default function LotteryEntrance() {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const raffleAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null;

  const [entranceFeeFromContract, setEntranceFeeFromContract] = useState("0");
  const [numPlayers, setNumPlayers] = useState("0");
  const [recentWinner, setRecentWinner] = useState("0");
  const dispatch = useNotification();
  const {
    runContractFunction: enterRaffle,
    isFetching,
    isLoading,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "enterRaffle",
    params: {},
    msgValue: entranceFeeFromContract,
  });
  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getEntranceFee",
    params: {},
  });
  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getNumberOfPlayers",
    params: {},
  });
  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getRecentWinner",
    params: {},
  });
  async function updateUI() {
    const entranceFeeFromContractCall = (await getEntranceFee()).toString();
    const numPlayersFromContractCall = (await getNumberOfPlayers()).toString();
    const recentWinnerContractCall = (await getRecentWinner()).toString();
    console.log(entranceFeeFromContractCall);

    setEntranceFeeFromContract(entranceFeeFromContractCall);
    setRecentWinner(recentWinnerContractCall);
    setNumPlayers(numPlayersFromContractCall);
  }
  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);
  const handleSuccess = async function (tx) {
    await tx.wait(1);
    handleNotification(tx);
    updateUI();
  };
  const handleNotification = function () {
    dispatch({
      type: "info",
      message: "Transaction complete!",
      title: "Tx Notification",
      position: "topR",
      icon: "bell",
    });
  };
  return (
    <div className="p-5">
      Hey
      {raffleAddress ? (
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white fond-bold py-2 px-4 rounded ml-auto"
            onClick={async function () {
              await enterRaffle({
                onSuccess: handleSuccess,
                onError: (error) => console.log(error),
              });
            }}
            disabled={isFetching || isLoading}
          >
            {isLoading || isFetching ? (
              <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
            ) : (
              "Enter Raffle"
            )}
          </button>
          <div>EntranceFee:</div>
          {ethers.utils.formatUnits(entranceFeeFromContract, "ether")} ETH
          <div>Number of Players: {numPlayers}</div>
          <div>recentWinner:{recentWinner}</div>
        </div>
      ) : (
        <div>No raffleAddress detected</div>
      )}
    </div>
  );
}
