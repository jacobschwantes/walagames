// TODO: Friends, challenges, leaderboard, call to action, etc
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
export const ActivityBar = async () => {
  const session = await getServerSession(authOptions);
  return (
    <div className=" w-80 h-full  px-4 flex flex-col gap-2.5 pb-4 bg-[#1a1e24]">

    </div>
  );
};
