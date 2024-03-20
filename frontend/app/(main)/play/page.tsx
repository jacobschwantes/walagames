import { cn } from "@/lib/utils";
import { LobbyEntrance } from "@/components/game/game-client";
import { auth } from "@/auth";
import Link from "next/link";
export default async function Home() {
  const session = await auth();
  const user = session?.user?.email;

  return (
    <main className="flex flex-col items-center p-24 ">
      <div className="flex flex-col gap-y-6  items-start w-full max-w-4xl">
        {/* BUTTONS */}

        <JoinLobbyOrHost />
      </div>{" "}
      {/* <LobbyEntrance user={user} /> */}
    </main>
  );
}
const games = [
  {
    name: "Join",
    href: "/join",
    classNames: {
      badge: "bg-sky-900/50 border-sky-400/40 shadow-sky-400",
      card: "bg-sky-400 border-sky-300 group-hover:shadow-sky-900/80",
      face: "from-sky-600 to-sky-800 via-sky-700",
      border: "border-sky-800 from-sky-900 via-sky-800 to-sky-900",
      icon: "text-sky-500",
    },
    icon: () => (
      <svg
        fill="currentColor"
        stroke="text-sky-500"
        viewBox="-5.0 -10.0 110.0 110.0"
      >
        <path d="m32.707 26.078 1.7578 3.043 10.605-6.1211c1.0195-0.55469 2.168-0.66016 3.2109-0.38281 1.0352 0.27734 1.9766 0.9375 2.582 1.918l0.15234 0.26562c0.52734 1.0078 0.625 2.1367 0.35156 3.1602-0.27344 1.0234-0.92188 1.9531-1.8867 2.5586l-10.652 6.1602 4.1445 7.1797 10.613-6.1211c1.0156-0.55078 2.1641-0.65625 3.2031-0.37891 1.0742 0.28906 2.0469 0.98828 2.6602 2.0547 0.58984 1.0508 0.70703 2.2266 0.42188 3.2852-0.28906 1.0742-0.98828 2.0508-2.0234 2.6484l-10.512 6.0703 1.8008 3.1211c0.39844 0.69141 0.16016 1.582-0.53125 1.9805l-11.367 6.5625c-4.25 2.4219-9.1055 2.9062-13.508 1.7266-3.6562-0.98047-7.0078-3.1055-9.4531-6.2148-0.73047 0.39062-1.4648 0.77734-2.1914 1.1836-1.5781 0.91797-2.6289 2.4375-3.0781 4.1367-0.44922 1.7148-0.28125 3.6016 0.57813 5.2578l0.17187 0.30859c0.98047 1.6836 2.5742 2.8242 4.3516 3.3008 1.75 0.46875 3.668 0.28906 5.3477-0.63672 0.39844-0.24609 3.0391-1.8477 3.2734-1.8906 2.8984-1.6719 6.2188-2.0117 9.2266-1.207 2.9531 0.79297 5.6172 2.6836 7.2969 5.4961l0.10156 0.16797c1.6797 2.9062 2.0156 6.2305 1.2109 9.2383-0.80859 3.0117-2.7617 5.7227-5.6641 7.3984l-7.0469 4.0664c-1.1914 0.69141-2.7188 0.28516-3.4062-0.91016-0.69141-1.1914-0.28516-2.7188 0.91016-3.4062l7.0469-4.0664c1.7109-0.98828 2.8633-2.5898 3.3398-4.3711 0.46484-1.7383 0.29297-3.6484-0.62891-5.3242l-0.15234-0.26172c-0.98828-1.6328-2.5547-2.7383-4.2891-3.2031s-3.6406-0.29297-5.3125 0.61719c-1.1211 0.66406-2.3008 1.3789-3.4453 1.9883-2.8711 1.6055-6.1289 1.918-9.0859 1.125-3.0078-0.80469-5.7188-2.7617-7.3945-5.6719l-0.23828-0.43359c-1.4688-2.793-1.7539-5.9766-1-8.8516 0.76953-2.9375 2.6367-5.5781 5.4492-7.2031 0.69531-0.40234 1.418-0.78125 2.1328-1.1562-1.5156-3.707-1.6953-7.7148-0.70703-11.41 1.1875-4.4375 4.0625-8.4258 8.332-10.891l11.281-6.5156c0.69531-0.40234 1.5859-0.16406 2.0312 0.60938zm59.781-19.43c1.1914-0.68359 2.7148-0.27344 3.3984 0.91797 0.68359 1.1914 0.27344 2.7148-0.91797 3.3984l-7.7734 4.4883c1.4922 3.6992 1.6641 7.6836 0.67969 11.355-1.1875 4.4336-4.0625 8.4258-8.332 10.891l-11.285 6.5117c-0.69141 0.39844-1.582 0.16016-1.9805-0.52734l-16.473-28.531c-0.40234-0.69531-0.16406-1.5859 0.52734-1.9883l11.285-6.5117c4.2695-2.4648 9.1602-2.9609 13.594-1.7734 3.6758 0.98438 7.0391 3.125 9.4961 6.2695l7.7812-4.4922z" />
      </svg>
    ),
  },
  {
    name: "Host",
    href: "/host",
    classNames: {
      badge: "bg-red-900/50 border-red-400/40 shadow-red-400",
      card: "bg-red-400 border-red-300 group-hover:shadow-red-900/80",
      face: "from-red-600 to-red-800 via-red-700",
      border: "border-red-800 from-red-900 via-red-800 to-red-900",
      icon: "text-red-500",
    },
    icon: () => (
      <svg fill="currentColor" viewBox="0 0 48 45">
        <path d="m33.76001,25.02997c-.92999-.92999-1.32001-2.26996-1.04999-3.58997,1-4.79999-.48004-9.73004-3.95001-13.19-4.16003-4.16003-10.35004-5.40002-15.79004-3.15002-.31.13-.53998.40002-.59998.72998-.07001.33002.03998.67004.27002.90002l5.70001,5.70001c.78998.78998,1.22998,1.83997,1.22998,2.96002,0,1.10999-.44,2.15997-1.22998,2.94995-1.63,1.63-4.28003,1.63-5.91003,0l-5.70001-5.69995c-.23999-.23004-.57001-.34003-.89996-.27002-.33002.06-.60004.28998-.73004.59998-2.25,5.42999-1.00995,11.63,3.15002,15.79004,3.46002,3.46997,8.39001,4.94,13.19,3.94995,1.32001-.26996,2.65997.12,3.59003,1.05005l8.41998,8.42999c1.20996,1.20996,2.78998,1.81,4.37,1.81s3.16998-.60999,4.37-1.81c1.16998-1.17004,1.81-2.72003,1.81-4.37s-.64001-3.20001-1.81-4.37l-8.42999-8.42004Z" />
      </svg>
    ),
  },
];

const JoinLobbyOrHost = () => {
  return (
    <ul className="grid grid-cols-2 w-full gap-5">
      {games.map((game) => (
        <Link
          key={game.name}
          href={game.href}
          className="group relative w-full aspect-video "
        >
          {/* bg border */}
          <div
            className={cn(
              "  w-full h-full -translate-y-[6px] group-hover:-translate-y-[2px]  group-hover:brightness-105   duration-300    overflow-hidden rounded-2xl absolute border-t-[1px] border-x-[1px]  transition-all z-10 inset-0 shadow-lg  ",
              game.classNames.card
            )}
          >
            {/* bg, border, shadow */}
            {/* <span
                  className={cn(
                    `block  border shadow-2xl py-1 rounded-xl absolute top-4  left-4 px-3 z-20`,
                    game.classNames.badge
                  )}
                >
                  <h2 className="text-lg font-medium text-white tracking-wide">
                    {game.name}
                  </h2>
                </span> */}
            <span
              className={cn(
                ` absolute bottom-3  left-5 z-20 block`
                // game.classNames.badge
              )}
            >
              <h2 className=" text-7xl text-white tracking-wide">
                {game.name}
              </h2>
            </span>

            {/* <div className="absolute  w-1/3 bottom-3 left-5 z-30 text-white group-hover:scale-105 duration-300 transition-all group-hover:-rotate-[8deg] ">
                  <game.icon />
                </div> */}
            {/* bg gradient */}
            <div
              className={cn(
                "rounded-b-[3rem] transition-all  bg-gradient-to-t w-full h-full scale-x-[1] scale-y-[.92] blur-xl group-hover:blur-[30px] duration-300 bottom-3 group-hover:bottom-4 absolute ",
                game.classNames.face
              )}
            ></div>
            <div
              className={cn(
                "absolute   duration-300 transition-all w-3/4 -bottom-12 -right-8  text-white opacity-35 group-hover:opacity-100 z-10 ",
                game.classNames.icon
              )}
            >
              <game.icon />
            </div>
          </div>
          {/* Border and bg gradient */}
          <span
            className={cn(
              " w-full h-full rounded-2xl transition-all absoute from-10% to-90% block inset-0 scale-x-[1] duration-300 bg-gradient-to-r border",
              game.classNames.border
            )}
          ></span>
        </Link>
      ))}
    </ul>
  );
};
