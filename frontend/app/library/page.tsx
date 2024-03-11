"use client";
import { auth } from "@/auth";
import SetTerm, { TextareaWithLabel } from "@/components/set/set-term";
import { PlusCircleIcon, PlusIcon, TrashIcon } from "lucide-react";
import type { NextPage } from "next";
import { useState } from "react";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

const defaultTerms = [
  {
    id: 1,
    term: "term",
    definition: "definition",
  },
  {
    id: 2,
    term: "term",
    definition: "definition",
  },
  // {
  //   id: 3,
  //   term: "term",
  //   definition: "definition",
  // },
  // {
  //   id: 4,
  //   term: "term",
  //   definition: "definition",
  // },
];

interface PageProps {}
const Page: NextPage<PageProps> = ({}) => {
  // const session = await auth();
  // const user = session?.user;
  const [name, setName] = useState("My set name");
  const [description, setDescription] = useState("My set description");
  const [terms, setTerms] = useState(defaultTerms);

  const handleNewTerm = (index: number) => {
    setTerms((prev) => {
      const copy = [...prev];
      copy.splice(index, 0, {
        // ! this strategy is not safe, but it's fine for now
        id: terms.length + 1,
        term: "term",
        definition: "definition",
      });
      return copy;
    });
  };

  const handleDeleteTerm = (index: number) => {
    setTerms((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  };
  return (
    <main className="w-full h-full flex flex-col gap-5 p-5 ">
      <div className="flex justify-between max-w-4xl mx-auto w-full ">
        <div className="flex flex-col">
          <h2 className="text-3xl">{name}</h2>
          <p>{description}</p>{" "}
        </div>
        <div className="flex gap-2">
          <Button className="btn-primary">Import</Button>
          <Button className="btn-primary">Save</Button>
        </div>
      </div>
      <ScrollArea className=" h-[75vh]">
        <Reorder.Group
          as="ul"
          axis="y"
          values={terms}
          onReorder={setTerms}
          className="flex flex-col max-w-4xl mx-auto gap-5 w-full"
        >
          <AnimatePresence initial={false}>
            {terms.map((term, index) => {
              return (
                <Reorder.Item
                  as="li"
                  value={term}
                  layout
                  className="flex flex-col gap-5 group"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.3,
                    ease: [0, 0.71, 0.2, 1.01],
                  }}
                  key={term.id}
                >
                  <div className="flex flex-col bg-gray-900 p-4 rounded-xl">
                    <button
                      onClick={() => handleDeleteTerm(index)}
                      className="btn-primary ml-auto "
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                    <SetTerm {...term} />
                  </div>
                  <button
                    onClick={() => handleNewTerm(index + 1)}
                    className="btn-primary rounded-full flex gap-1 w-full bg-gray-800 h-1 relative "
                  >
                    <span className="absolute left-0 right-0 flex items-center justify-center gap-1 -translate-y-1/2 top-1/2">
                      <PlusIcon className="h-4 w-4" />
                      <span>Add term</span>
                    </span>
                  </button>
                </Reorder.Item>
              );
            })}
          </AnimatePresence>
        </Reorder.Group>
      </ScrollArea>
    </main>
  );
};
export default Page;
