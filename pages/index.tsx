import {
  useAddress,
  useContract,
  useContractRead,
  useContractWrite,
} from "@thirdweb-dev/react";
import { ethers } from "ethers";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import CountdownTimer from "../components/CountdownTimer";
import Header from "../components/Header";
import Loading from "../components/Loading";
import Login from "../components/Login";
import { currency } from "../constants";
import toast from "react-hot-toast";
import Marquee from "react-fast-marquee";
import AdminControls from "../components/AdminControls";

const Home: NextPage = () => {
  const address = useAddress();
  const [quantity, setQuantity] = useState<number>(1);
  const [userTickets, setUserTickets] = useState(0);
  const { contract, isLoading } = useContract(
    process.env.NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS
  );

  const { data: remainingTickets } = useContractRead(
    contract,
    "RemainingTickets"
  );
  const { data: currentWinningReward } = useContractRead(
    contract,
    "CurrentWinningReward"
  );
  const { data: ticketPrice } = useContractRead(contract, "ticketPrice");
  const { data: ticketCommission } = useContractRead(
    contract,
    "ticketCommission"
  );
  const { data: expiration } = useContractRead(contract, "expiration");

  const { mutateAsync: BuyTickets } = useContractWrite(contract, "BuyTickets");

  const { data: tickets } = useContractRead(contract, "getTickets");
  const { data: winnings } = useContractRead(
    contract,
    "getWinningsForAddress",
    address
  );
  const { mutateAsync: WithdrawWinnings } = useContractWrite(
    contract,
    "WithdrawWinnings"
  );
  const { data: lastWinner } = useContractRead(contract, "lastWinner");
  const { data: lastWinnerAmt } = useContractRead(contract, "lastWinnerAmount");
  const { data: isOwner } = useContractRead(contract, "lotteryOperator");

  useEffect(() => {
    if (!tickets) return;

    const totalTickets: string[] = tickets;

    const noOfUserTickets = totalTickets.reduce(
      (total, ticketAddress) => (ticketAddress === address ? total + 1 : total),
      0
    );
    setUserTickets(noOfUserTickets);
  }, [tickets, address]);

  const handleClick = async () => {
    if (!ticketPrice) return;
    const notification = toast.loading("Buying your tickets...");

    try {
      const data = await BuyTickets([
        {
          value: ethers.utils.parseEther(
            (
              Number(ethers.utils.formatEther(ticketPrice)) * quantity
            ).toString()
          ),
        },
      ]);

      toast.success("Tickets purchased successfully!", {
        id: notification,
      });

      console.info("contract call success", data);
    } catch (error) {
      toast.error("Whoops something went wrong!", {
        id: notification,
      });
      console.log("contract call failure", error);
    }
  };

  const onWithdrawalWinnings = async () => {
    const notification = toast.loading("Withdrawing winnings...");

    try {
      const data = await WithdrawWinnings([{}]);

      toast.success("Winnings withdrawn successfully!", {
        id: notification,
      });
    } catch (error) {
      toast.error("Whoops something went wrong!", {
        id: notification,
      });
      console.error("Contract call failure, error");
    }
  };

  if (isLoading) return <Loading />;
  if (!address) {
    return <Login />;
  }

  return (
    <div className="bg-[#091B18] min-h-screen flex flex-col">
      <Head>
        <title>Kuly Lottery</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex-1">
        <Header />
        <Marquee className="bg-[#0A1F1C] p-5 mb-5" gradient={false} speed={100}>
          <div className="flex space-x-2 mx-10">
            <h4 className="text-white font-bold">
              Last Winner: {lastWinner?.toString()}
            </h4>
            <h4 className="text-white font-bold">
              Previous Winnings:{" "}
              {lastWinnerAmt &&
                ethers.utils.formatEther(lastWinnerAmt?.toString())}
            </h4>
          </div>
        </Marquee>

        {isOwner === address && (
          <div className=" flex justify-center">
            <AdminControls />
          </div>
        )}

        {winnings > 0 && (
          <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto mt-5">
            <button
              onClick={onWithdrawalWinnings}
              className="p-5 bg-gradient-to-b animate-pulse from-orange-500 to-emerald-600 text-center rounded-xl w-full"
            >
              <p>Winner Winner Winner!!! </p>
              <p className="font-bold">
                Total Winnings: {ethers.utils.formatEther(winnings.toString())}{" "}
                {currency}
              </p>
              <br />
              <p className="font-semibold">Click here to withdraw</p>
            </button>
          </div>
        )}
        {/* the next draw box */}
        <div
          className="space-y-5 md:space-y-0 m-5
         md:flex md:flex-row items-start justify-center
          md:space-x-5 "
        >
          <div className="stats-container">
            <h1 className="text-5xl text-white text-center">The Next Draw</h1>

            <div className="flex justify-between p-2 space-x-2">
              <div className="stats">
                <h2 className="text-sm">Total Pool</h2>
                <p className="text-xl">
                  {currentWinningReward &&
                    ethers.utils.formatEther(
                      currentWinningReward.toString()
                    )}{" "}
                  {currency}
                </p>
              </div>
              <div className="stats">
                <h2 className="text-sm">Tickets Remaining</h2>
                <p className="text-xl">{remainingTickets?.toNumber()}</p>
              </div>
            </div>

            {/* Countdown timer */}
            <div className="mt-5 mb-3">
              <CountdownTimer />
            </div>
          </div>
          <div className="stats-container space-y-2">
            <div className="stats-container">
              <div className="flex justify-between items-center text-white pb-2">
                <h2 className="">Price per ticket</h2>{" "}
                <p>
                  {ticketPrice &&
                    ethers.utils.formatEther(ticketPrice.toString())}{" "}
                  ETH
                </p>
              </div>
              <div className="flex text-white items-center space-x-2 bg-[#091B18] border-[#004337] border p-4">
                <p>TICKETS</p>
                <input
                  type="number"
                  className="flex w-full bg-transparent text-right outline-none"
                  min={1}
                  max={10}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2 mt-5">
                <div className="flex items-center justify-between text-emerald-300 text-sm font-extrabold">
                  <p>Total costs of tickets </p>
                  <p>
                    {ticketPrice &&
                      Number(ethers.utils.formatEther(ticketPrice.toString())) *
                        quantity}{" "}
                    {currency}
                  </p>
                </div>
                <div className="flex items-center justify-between text-emerald-300 text-xs italic">
                  <p>Service Fees</p>
                  <p>
                    {" "}
                    {ticketCommission &&
                      ethers.utils.formatEther(
                        ticketCommission.toString()
                      )}{" "}
                    ETH
                  </p>
                </div>
                <div className="flex items-center justify-between text-emerald-300 text-xs italic">
                  <p>+ Network Fees</p>
                  <p>TBC</p>
                </div>
                <button
                  disabled={
                    expiration?.toString() < Date.now().toString() ||
                    remainingTickets?.toNumber() === 0
                  }
                  onClick={handleClick}
                  className="mt-5 w-full bg-gradient-to-br
                   from-orange-500 to-emerald-600 
                   px-10 py-5 rounded-md text-white 
                   shadow-xl disabled:from-gray-500
                    disabled:to-gray-600 disabled:cursor-not-allowed 
                    font-semibold disabled:text-gray-100"
                >
                  Buy {quantity} tickets for{" "}
                  {ticketPrice &&
                    Number(ethers.utils.formatEther(ticketPrice.toString())) *
                      quantity}{" "}
                  {currency}
                </button>
              </div>
              {userTickets > 0 && (
                <div className="stats">
                  <p className="text-lg mb-2">
                    You have {userTickets} Tickets in this draw
                  </p>
                  <div className="flex max-w-sm flex-wrap gap-x-2 gap-y-2">
                    {Array(userTickets)
                      .fill("")
                      .map((_, index) => (
                        <p
                          key={index}
                          className="text-emerald-300 h-20 w-12 bg-emerald-500/30 
                         rounded-lg flex flex-shrink-0 items-center justify-center text-xs italic"
                        >
                          {index + 1}
                        </p>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* the price ticket box */}
      </div>
      <footer className="border-t border-emerald-500/20 flex items-center text-white justify-between p-5">
        <img
          className="h-10 w-10 filter hue-rotate-90 opacity-20 rounded-full"
          src="https://www.shutterstock.com/image-vector/lottery-numbers-flying-realistic-drawing-260nw-1756695563.jpg"
          alt=""
        />
        <p className="text-xs text-emerald-900 pl-5">
          This is a project showcasing the use of smart contracts in lottery.
          The smart contract was written in solidity and deployed using
          thirdweb. The Frond End was done in next js. @Author - smartCon
        </p>
      </footer>
    </div>
  );
};

export default Home;
