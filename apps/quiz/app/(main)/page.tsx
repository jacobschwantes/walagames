import { fetchQuizMany } from "@/actions/quiz";
import { TestAction } from "@/actions/test";
import { fetchUserProfilesByIds } from "@/actions/user";
import { AnimatedContainer } from "@/components/container/animated-container";
import Podium from "@/components/game/podium";
import CountdownTimer from "@/components/game/timer";
import QuizCard from "@/components/quiz/quiz-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CarouselItem,
  CarouselSize,
  FeaturedQuizCarousel,
} from "@/components/ui/carousel";
import { toast } from "sonner";

export default async function Home() {
   const quizzes = await fetchQuizMany({});
   if ("error" in quizzes) {
     return <div>{quizzes.error}</div>;
   }

     const ownerIds =
      quizzes.data && quizzes.data.length > 0
         ? [...new Set(quizzes.data.map((q) => q.owner_id))]
         : [];

   const profiles = await fetchUserProfilesByIds(ownerIds);
   if ("error" in profiles) {
     return <div>{profiles.error}</div>;
   }

   const sorted = quizzes.data.sort(
     (a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at)
   );
  return (
    <main className="flex flex-col items-center  ">
      <FeaturedQuizCarousel>
        {sorted.map((quiz, index) => (
          <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/4 ">
            <QuizCard quiz={quiz} profile={profiles.data[quiz.owner_id]} />
          </CarouselItem>
        ))}
      </FeaturedQuizCarousel>
    </main>
  );
}
