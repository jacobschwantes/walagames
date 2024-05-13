"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  Reorder,
  useDragControls,
} from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { coerce, z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  EditIcon,
  GripVerticalIcon,
  Maximize2,
  Minimize2,
  PlusIcon,
  Trash,
} from "lucide-react";
import type { QuestionType } from "@/lib/types";
import { motion } from "framer-motion";
import { CheckIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { IconEdit, IconPencil, IconTrash, IconX } from "@tabler/icons-react";
import { useQuizContext } from "../providers/quiz-provider";
import { useSearchParams } from "next/navigation";
import { Textarea } from "../ui/textarea";
import { uniqueId } from "lodash";
import { Value } from "@radix-ui/react-select";

function Question({ value, index }: { value: QuestionType; index: number }) {
  const { dispatch } = useQuizContext();
  const controls = useDragControls();
  const params = useSearchParams();
  const isEditing = params.get("edit") != null;

  function startDrag(event) {
    controls.start(event);
  }
  const [expanded, setExpanded] = useState(false);
  const lastToggleTimeRef = useRef(Date.now());
  const debounceInterval = 400;

  const toggleOpen = useCallback(() => {
    const currentTime = Date.now();
    if (currentTime - lastToggleTimeRef.current > debounceInterval) {
      setExpanded((prev) => !prev);
      lastToggleTimeRef.current = currentTime;
    }
  }, []);

  return (
    <Reorder.Item
      dragControls={controls}
      id={value.id}
      dragListener={false}
      draggable={false}
      as="li"
      value={value}
      initial={{ scale: 0.7, opacity: 0 }}
      exit={{
        scale: 0.9,
        opacity: 0,
        transition: { duration: 0.3, restDelta: 1, ease: [0, 0.71, 0.2, 1.01] },
      }}
      animate={{
        scale: 1,
        opacity: 1,

        transition: {
          duration: 0.3,
          ease: [0, 0.71, 0.2, 1.01],
          restDelta: 1,
        },
      }}
      transition={{
        duration: 0.3,
        ease: [0, 0.71, 0.2, 1.01],
        restDelta: 1,
      }}
      className={cn(
        "flex flex-col bg-[#242a32] rounded-xl  group relative p-5 gap-2"
      )}
    >
      <motion.div
        layout="position"
        className="w-full flex justify-between items-center "
      >
        <motion.div layout className="flex items-center gap-1.5 ">
          {isEditing ? (
            <Button onPointerDown={startDrag} size="icon" variant="outline">
              <GripVerticalIcon className="h-4 w-4" />
            </Button>
          ) : (
            <motion.span  className="text-xl w-8 h-8 flex items-center">
              {index + 1}.
            </motion.span>
          )}
          <motion.h2 layout className="text-xl">
            {value.question}
          </motion.h2>
        </motion.div>

        {isEditing ? (
          <motion.div layout="position" className="flex gap-1">
            <EditQuestionDialog question={value} />
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                console.log("called delete");
                dispatch({ type: "DELETE_QUESTION", payload: value.id });
              }}
              className=""
            >
              <IconTrash className="h-4 w-4" />
            </Button>
          </motion.div>
        ) : (
          <Button onClick={toggleOpen} size="icon" variant="outline">
            {expanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        )}
      </motion.div>

      {(expanded || isEditing) && (
        <motion.ul
          exit={{ scaleY: 0.95, opacity: 0 }}
          initial={{ scaleY: 0.95, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: [0, 0.71, 0.2, 1.01] }}
          layout
          className={cn(
            " w-full gap-2 grid grid-cols-2",
            value.answers.length > 2 && "grid-rows-2"
          )}
        >
          {value.answers.map((answer, index) => (
            <Answer
              {...answer}
              index={index}
              color={(answerColors[index] as keyof typeof colors) || "sky"}
            />
          ))}
        </motion.ul>
      )}
    </Reorder.Item>
  );
}

const colors = {
  // bg-blue-600 inner-shadow border border-blue-500/80 hover:bg-blue-500
  sky: {
    answer: "bg-sky-600 inner-shadow border border-sky-500/80",
    edit: "bg-sky-950/30 border-sky-600 ring-sky-600",
  },
  violet: {
    answer: "bg-violet-700 inner-shadow border border-violet-600/80",
    edit: "bg-violet-950/30 border-violet-600 ring-violet-600",
  },
  yellow: {
    answer: "bg-yellow-600 inner-shadow border border-yellow-500/80",
    edit: "bg-yellow-950/30 border-yellow-600 ring-yellow-600",
  },
  green: {
    answer: "bg-green-600 inner-shadow border border-green-500/80",
    edit: "bg-green-950/30 border-green-600 ring-green-600",
  },
  red: {
    answer: "bg-red-600 inner-shadow border border-red-500/80",
    edit: "bg-red-950/30 border-red-600 ring-red-600",
  },
  blue: {
    answer: "bg-blue-600 inner-shadow border border-blue-500/80",
    edit: "bg-blue-950/30 border-blue-600 ring-blue-600",
  },
};

const answerColors = ["blue", "violet", "yellow", "red"];

const Answer = ({
  text,
  correct,
  id,
  color = "sky",
}: {
  text: string;
  correct: boolean;
  index: number;
  id: string;
  color?: keyof typeof colors;
}) => {
  return (
    <li
      className={cn(
        "flex-1   min-h-16 flex items-center justify-center relative"
        // colors[color].answer
      )}
    >
      <div
        className={cn(
          "inset-0 absolute rounded-[var(--radius)]",
          colors[color].answer,
          !correct && "opacity-35"
        )}
      />
      <p
        className={cn(
          "relative z-10 flex items-center",
          !correct && "brightness-95"
        )}
      >
        {correct && <CheckIcon className="h-5 w-5" />}
        {text}
      </p>
    </li>
  );
};

export function QuestionList() {
  const { state, dispatch } = useQuizContext();

  return (
    <Reorder.Group
      as="ul"
      axis="y"
      values={state.quiz.questions}
      onReorder={(newOrder) => {
        console.log(newOrder);
        dispatch({ type: "REORDER_QUESTIONS", payload: newOrder });
      }}
      className="flex flex-col  mx-auto  w-full max-w-6xl pt-4 gap-4 "
    >
      <AnimatePresence mode="sync" initial={false}>
        <LayoutGroup>
          {state.quiz.questions.map((question, index) => {
            return (
              <Question key={question.id} value={question} index={index} />
            );
          })}
        </LayoutGroup>
      </AnimatePresence>
    </Reorder.Group>
  );
}
const AnswerSchema = z.object({
  id: z.string(),
  text: z.string(),
  correct: z.boolean(),
});

const FormSchema = z.object({
  question: z.string(),
  answers: z.array(AnswerSchema),
});

// const FormSchema = z.object({
//   question: z.string(),
//   type: z.string(z.union([z.literal("multiple"), z.literal("blank")])),
// });

function EditQuestionDialog({ question }: { question: QuestionType }) {
  const { dispatch } = useQuizContext();
  const [open, setOpen] = useState(false);
  // const form = useForm<z.infer<typeof FormSchema>>({
  //   resolver: zodResolver(FormSchema),
  //   defaultValues: {
  //     type: "multiple",
  //     question: question.question,
  //   },
  // });
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      question: question.question,
      answers: question.answers || [{ id: uuidv4(), text: "", correct: false }],
    },
  });

  const adjustHeight = (element) => {
    const minHeight = 20; // This should match your CSS min-height for .auto-expanding-textarea

    // Temporarily shrink to measure the natural smaller height
    element.style.height = `${minHeight}px`;
    const requiredHeight = element.scrollHeight;

    // Set height to either its natural height or the scrolled height, whichever is larger
    element.style.height = `${Math.max(requiredHeight, minHeight)}px`;
  };

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "answers",
    keyName: "uid",
  });

  // console.log(form.watch(['answers']))

  const correctAnswerId = form.watch("answers").find((a) => a.correct)?.id;
  // console.log(correctAnswerId)

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);
    dispatch({
      type: "SET_QUESTION",
      payload: { ...question, question: data.question, answers: data.answers },
    });
    setOpen(false);
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline">
          <IconEdit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="sm:max-w-5xl flex flex-col gap-3"
      >
        <DialogHeader>
          <DialogTitle>Edit question</DialogTitle>
          <DialogDescription>
            Make changes to your question here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full gap-3 flex flex-col"
          >
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl className="">
                    <Textarea
                      autoComplete="off"
                      placeholder="My great question..."
                      className="text-lg min-h-16"
                      {...field}
                    />
                  </FormControl>
                  {/* <FormDescription>
                    This is your public display name.
                  </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormLabel>Answers</FormLabel>
            <div className="grid grid-cols-2 gap-3 w-full">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className={cn(
                    "flex-1 rounded-[var(--radius)]  min-h-16 flex items-center justify-center relative",
                    colors[
                      (answerColors[index] as keyof typeof colors) || "sky"
                    ].answer
                  )}
                >
                  <Button
                    className="absolute top-0.5 right-0.5 bg-background/50 border-input/10"
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => remove(index)}
                  >
                    <IconX className="h-5 w-5" />
                  </Button>

                  <Button
                    className={cn(
                      "absolute top-0.5 left-0.5 bg-background/50 border-input/10",
                      field.id === correctAnswerId && ""
                    )}
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      fields.forEach((f, i) => {
                        form.setValue(
                          `answers.${i}.correct`,
                          f.id === field.id
                        );
                      });
                    }}
                  >
                    {field.id === correctAnswerId && (
                      <CheckIcon className="h-5 w-5 text-green-500 brightness-150" />
                    )}
                  </Button>
                  <Controller
                    name={`answers.${index}.text`}
                    control={form.control}
                    render={({ field }) => (
                      <textarea
                        placeholder="My answer..."
                        rows={1}
                        {...field}
                        spellCheck={false}
                        className="bg-transparent  h-5 placeholder:text-zinc-200 leading-none  w-3/4 text-center outline-none border-none resize-none pt-0.5 overflow-hidden whitespace-pre-wrap break-words max-h-none"
                        onInput={(e) => adjustHeight(e.target)}
                      />
                    )}
                  />
                </div>
              ))}

              {fields.length < 4 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    append({ id: uuidv4(), text: "", correct: false })
                  }
                  className={cn(
                    "flex-1 rounded-[var(--radius)]  min-h-16 flex items-center justify-center"
                    // colors["sky"].answer
                  )}
                >
                  New answer
                </Button>
              )}
            </div>

            <DialogFooter>
              <Button variant="action" type="submit">
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
