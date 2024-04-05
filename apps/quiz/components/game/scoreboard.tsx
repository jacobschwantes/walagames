import { twMerge } from "tailwind-merge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface ScoreboardProps {
  username: string;
  lobbyState: any;
}

function Scoreboard({ username, lobbyState }: ScoreboardProps) {
  return (
    <div className="flex min-h-full flex-col border rounded-lg p-2 max-w-xs w-full flex-1 gap-2">
      <h2 className="font-medium">Leaderboard</h2>
      <ol className="gap-2 flex flex-col">
        {lobbyState.gameState.players &&
          lobbyState.gameState.players
            .sort((a, b) => b.score - a.score)
            .map((player, idx) => (
              <li
                className="flex items-center gap-2 justify-between"
                key={player.username}
              >
                <h3 className="flex items-center gap-2 text-sm">
                  <Avatar
                    className={twMerge(
                      "font-medium text-zinc-600 h-6 w-6 flex items-center justify-center aspect-square rounded-full border-2 ",
                      idx === 0 && "border-yellow-400",
                      idx === 1 && "border-gray-400",
                      idx === 2 && "border-orange-800"
                    )}
                  >
                    <AvatarImage
                      alt="avatar"
                      src={
                        player.imageURL ||
                        `https://api.dicebear.com/7.x/notionists/svg?seed=${player.username}`
                      }
                    />
                    <AvatarFallback className="text-xs">JS</AvatarFallback>
                    {/* {idx + 1} */}
                  </Avatar>
                  {player.username === username ? "You" : player.username}
                </h3>
                <span className="block text-sm">{player.score}</span>
              </li>
            ))}
      </ol>
    </div>
  );
}

export { Scoreboard };
