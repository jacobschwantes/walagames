"use client";
import { motion } from "framer-motion";
import { Avatar, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
interface PodiumProps {}
const players = [
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=2487&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    name: "bob123",
    score: 534,
    position: "2nd",
    delay: 0.05,
  },
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=1889&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    name: "johndue",
    score: 1243,
    position: "1st",
    delay: 0.025,
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=2550&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    name: "janedoe",
    score: 343,
    position: "3rd",
    delay: 0.025,
  },
];
const Podium: React.FC<PodiumProps> = ({}) => (
  <div className="flex flex-col w-full max-w-4xl items-center">
    <div className="flex gap-1.5 items-end h-72 overflow-hidden">
      {players.map(({ id, image, name, score, position, delay }, idx) => (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0, 0.71, 0.2, 1.01], delay }}
          className="flex flex-col group "
        >
          <div className="relative mx-auto -mb-7">
            <div className=" flex justify-center flex-col relative z-10">
              <div className="relative ">
                <Avatar
                  className={cn(
                    "h-20 w-20 border-2 border-white rounded-full relative z-10 bg-[#1a1e24] group-even:border-yellow-500",
                    position === "1st" && "h-24 w-24"
                  )}
                >
                  <AvatarImage
                    className=" object-cover"
                    alt="avatar"
                    src={
                      // image ||
                      `https://api.dicebear.com/7.x/notionists/svg?seed=${name}`
                    }
                  />
                  {/* <AvatarFallback className="text-xs">{name}</AvatarFallback> */}
                </Avatar>
                {position === "1st" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.2 }}
                    transition={{
                      duration: 2,
                      ease: [0, 0.71, 0.2, 1.01],
                      delay: 0.125,
                    }}
                    className="scale-[1.5] hue-rotate-[5deg] absolute inset-0"
                  >
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 40,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      style={{
                        backgroundImage: "url(/rays.png)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        // backgroundBlendMode: "multiply"
                      }}
                      className=" w-full h-full"
                    ></motion.div>
                  </motion.div>
                )}
              </div>
              <div
                className={cn(
                  " -mt-3 relative z-10 bg-[#2e3640] rounded-full text-xs mx-auto px-2 py-1 font-medium",
                  position == "1st" && "bg-yellow-500 text-zinc-900"
                )}
              >
                {position}
              </div>
            </div>
          </div>
          <div
            // style={{ transformOrigin: "bottom" }}

            className=" w-44 group-odd:w-40 h-40 group-last:h-32 group-first:h-36 flex justify-end flex-col  "
          >
            {/* <div
              style={{ perspective: "5.7rem" }}
              className=" w-[9rem] mx-auto group-odd:w-[8.25rem] translate-y-[10px]"
            >
              <div
                style={{ transform: "rotateX(60deg)" }}
                className="w-full h-10 bg-gradient-to-t  from-[#20252d] to-[#242a3200] rounded-sm"
              ></div>
            </div>
            <div className="w-full bg-gradient-to-t from-[#242a3200] to-[#242a32] h-full flex p-4 justify-center rounded-t-sm relative z-20 group-even:top-shadow-yellow">
              <h2 className="">{name}</h2>
            </div> */}

            <div
              style={{ perspective: "5.7rem" }}
              className=" w-[9rem] group-odd:w-[8.25rem] mx-auto translate-y-[12px]"
            >
              <div
                style={{ transform: "rotateX(60deg)" }}
                className="w-full h-10 bg-gradient-to-t from-violet-500 to-violet-800/70 group-even:to-yellow-800/70 group-even:from-yellow-500   group-first:to-blue-800/70 group-first:from-blue-500 rounded-sm "
              ></div>
            </div>
            <div className="w-full group-first:to-blue-500 bg-gradient-to-t group-even:to-yellow-500  group-even:from-yellow-500 group-first:from-blue-500 top-shadow from-violet-500 to-violet-500 h-full flex p-3 justify-center  rounded-t-sm relative z-20 ">
              <h2 className="  relative z-10 text-white">{name}</h2>
              {/* <span className="absolute left-0 right-0 -bottom-3 text-[5rem] group-even:text-[7rem] leading-none group-last:text-[4rem]  flex items-center justify-center  font-bold text-center group-even:text-yellow-900/30 group-first:text-blue-900/30 group-last:text-violet-900/30">
                {id}
              </span> */}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
    <motion.div
      transition={{ duration: 0.4, ease: [0, 0.71, 0.2, 1.01] }}
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-[#1d2229] rounded-2xl border max-w-3xl"
    >
      <Table className=" ">
        {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
        <TableHeader className=" ">
          <TableRow className="">
            <TableHead className="w-[100px] font-normal text-zinc-100 ">
              Place
            </TableHead>
            <TableHead className=" font-normal text-zinc-100">Player</TableHead>
            {/* <TableHead className="w-[100px]">Method</TableHead> */}
            <TableHead className="text-right  font-normal text-zinc-100">
              Score
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player, idx) => (
            <TableRow key={player.id}>
              <TableCell className="">#{idx + 4}</TableCell>
              <TableCell className="flex items-center gap-2">
                <Avatar className="h-7 w-7 border border-white rounded-full relative z-10 bg-[#1a1e24] group-even:border-yellow-500">
                  <AvatarImage
                    className=" object-cover"
                    alt="avatar"
                    src={
                      // image ||
                      `https://api.dicebear.com/7.x/notionists/svg?seed=${player.name}`
                    }
                  />
                  {/* <AvatarFallback className="text-xs">{name}</AvatarFallback> */}
                </Avatar>
                {player.name}
              </TableCell>
              <TableCell className="text-right">{player.score}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        {/* <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$2,500.00</TableCell>
        </TableRow>
      </TableFooter> */}
      </Table>
    </motion.div>
  </div>
);
export default Podium;
