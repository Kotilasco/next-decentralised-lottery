import React from "react";
import NavButton from "./NavButton";
import { Bars3BottomRightIcon } from "@heroicons/react/24/solid";
import { useAddress, useDisconnect } from "@thirdweb-dev/react";

function Header() {
  const address = useAddress();
  const disconnect = useDisconnect();
  return (
    <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-5 justify-between items-start p-5">
      <div className="flex items-center space-x-2">
        <img
          src="https://www.shutterstock.com/image-vector/lottery-numbers-flying-realistic-drawing-260nw-1756695563.jpg"
          alt=""
          className="rounded-full h-20 w-20"
        />
        <div className="flex flex-col py-2">
          <h1 className="text-lg text-white font-bold">Kuly Draw</h1>
          <p className="text-xs text-emerald-500 truncate">
            User: {address?.substring(0, 5)}...
            {address?.substring(address.length, address.length - 5)}
          </p>
        </div>
      </div>

      <div className="hidden md:col-span-3 md:flex items-center justify-center rounded-md">
        <div className="bg-[#0A1F1C] p-4 space-x-2">
          <NavButton onClick={disconnect} isActive title="But Tickets" />
          <NavButton onClick={disconnect} title="Logout" />
        </div>
      </div>

      <div className="flex flex-col ml-auto text-right">
        <Bars3BottomRightIcon className="h-8 w-8 mx-auto text-white cursor-pointer" />
        <span className="md:hidden">
          <NavButton onClick={disconnect} title="Logout" />
        </span>
      </div>
    </div>
  );
}

export default Header;
