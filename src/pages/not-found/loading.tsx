export default function Loading() {
  return (
    <div>
      <div className="absolute flex items-center justify-center mb-16 text-center -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
        <div className="bg-gradient-to-b from-foreground to-transparent bg-clip-text text-[0.5rem] md:text-[2rem] font-extrabold leading-none text-transparent">
          Loading
        </div>
        {/* <div className="mx-2 three-body">
          <div className="three-body__dot"></div>
          <div className="three-body__dot"></div>
          <div className="three-body__dot"></div>
        </div> */}
        <div className="px-2 balls">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  );
}
