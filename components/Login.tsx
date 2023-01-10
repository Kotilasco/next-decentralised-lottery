import React from "react";
import { ConnectWallet } from "@thirdweb-dev/react";

function Login() {
  return (
    <div className="bg-[#091B18] min-h-screen flex flex-col items-center justify-center text-center">
      <div className="flex flex-col items-center mb-10">
        <img
          src="https://www.shutterstock.com/image-vector/lottery-numbers-flying-realistic-drawing-260nw-1756695563.jpg"
          alt=""
          className="rounded-full h-56 w-56 mb-10"
        />
        <h1 className="text-6xl text-white font-bold">KULY DRAW</h1>
        <h2 className="text-white">
          Get started by logging in with your Metamask
        </h2>

        <ConnectWallet className="bg-white py-8 mt-10 rounded-lg shadow-lg font-bold" />
      </div>
    </div>
  );
}

export default Login;
