export default function Sidebar() {
  return (
    <div className="h-full w-[35%] flex flex-col border-l border-[#2C2C38]">
      <div className="flex w-full h-28 border-b border-[#2C2C38]">
        <h1 className="text-amber-50 font-mono">Members</h1>
      </div>
      <div className="flex w-full h-full">
        <h1 className="text-white text-9xl font-mono">Chat</h1>
      </div>
    </div>
  );
}
