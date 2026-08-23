import { useState } from "react";

export default function Hnavbar() {
  const link = "watchparty.app/r/watchnow";
  const [copy, isCopied] = useState(false);
  return (
    <div className="h-12 w-full flex border-b px-4 border-[#2C2C38] items-center justify-center">
      <p className="text-[#7f7fac] px-4">link : {link}</p>
      <button
        onClick={() => {}}
        className="text-[#2C2C38] px-2 py-0.5 text-sm border-[#afafcd]  items-center border rounded-full"
      >
        copy
      </button>
    </div>
  );
}
