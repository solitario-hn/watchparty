function App() {
  return (
    <div className="h-screen w-screen flex bg-black">
      <div className="flex flex-col h-full w-full bg-amber-50">
        <div className="flex flex-row h-[30%] w-full bg-amber-950 items-center justify-between p-2.5">
          <div className="flex h-12.5 w-12.5 bg-blue-500 rounded-full"></div>
          <div className="flex h-12.5 w-12.5 bg-yellow-500 rounded-full"></div>
          <div className="flex h-12.5 w-12.5 bg-pink-200 rounded-full"></div>
        </div>
        <div className="flex h-full w-full bg-amber-800">
          <video width="100%" height="100%" controls>
            <source
              src="https://samplelib.com/mp4/sample-5s.mp4"
              type="video/mp4"
            />
          </video>
        </div>
      </div>
      <div className="flex flex-col h-full w-[55%]  bg-amber-400">
        <div className="flex h-[30%] w-full bg-pink-700"></div>
        <div className="flex h-full w-full bg-purple-700"></div>
      </div>
    </div>
  );
}

export default App;
