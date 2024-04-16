"use client";
import { useCallback, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { v4 as uuidv4 } from "uuid";
import {
  AnimatePresence,
  LayoutGroup,
  Reorder,
  useDragControls,
} from "framer-motion";

import {
  GripVertical,
  Maximize2,
  Minimize2,
  Pencil,
  PlusIcon,
  Save,
  Trash,
  Trash2Icon,
  TrashIcon,
  XIcon,
} from "lucide-react";
import type { Question } from "@/lib/types";
import { motion } from "framer-motion";
import { PushButton } from "../ui/custom-button";
import { CheckIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "../ui/input";
import { debounce } from "lodash";

const QuestionItem = ({
  id,
  question,
  answers,
  isEditingQuiz,
  handleDeleteQuestion,
  handleEditQuestion,
  handleSaveQuestion,
  index,
  value,
  isEditing,
  ...props
}: Question & {
  questionNumber: number;
  isEditingQuiz: boolean;

  index: number;
  handleDeleteQuestion: (index: number) => void;
  handleEditQuestion: (id: string | null) => void;
  handleSaveQuestion: (newQuestion) => void;
  isEditing: boolean;
}) => {
  const [questionValue, setQuestionValue] = useState(question);
  const [answerValues, setAnswerValues] = useState(answers);
  const [expanded, setExpanded] = useState(false);
  const lastToggleTimeRef = useRef(Date.now());
  const debounceInterval = 400;
  const saveQuestion = () => {
    handleSaveQuestion({
      id,
      question: questionValue,
      answers: answerValues,
    });
  };

  const toggleOpen = useCallback(() => {
    const currentTime = Date.now();
    if (currentTime - lastToggleTimeRef.current > debounceInterval) {
      setExpanded((prev) => !prev);
      lastToggleTimeRef.current = currentTime;
    }
  }, []);

  const addAnswer = (index: number) => {
    const id = uuidv4();
    setAnswerValues((prev) => {
      const copy = [...prev];
      copy.splice(index, 0, {
        id,
        text: "My answer is...",
        correct: false,
      });
      return copy;
    });
  };

  return (
    <Reorder.Item
      id={id}
      dragListener={isEditing}
      draggable={isEditing}
      // whileTap={
      //   isEditing ? { cursor: "grabbing", scale: 1.03, zIndex: 1000 } : {}
      // }
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
      // key={id}

      className={cn(
        "flex flex-col bg-[#242a32] rounded-xl  group relative p-6"
      )}
    >
      <motion.div
        layout="position"
        className="flex justify-between items-center"
      >
        {isEditing ? (
          <div className="w-full pr-6">
            <Input
              value={questionValue}
              onChange={(e) => setQuestionValue(e.target.value)}
            />{" "}
          </div>
        ) : (
          <h2 className={cn("text-xl")}>{question}</h2>
        )}

        {!isEditingQuiz && (
          <button
            className="text-zinc-300 hover:text-white transition-colors duration-200 items-center jusitfy-center flex"
            onClick={toggleOpen}
          >
            {expanded ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </button>
        )}
      </motion.div>
      {isEditingQuiz && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1 absolute top-0 right-0 z-20 p-2"
        >
          <button
            onClick={() => handleDeleteQuestion(index)}
            className="btn-primary ml-auto bg-background rounded-[.4rem] p-1.5"
          >
            <Trash className="h-4 w-4 text-red-500" />
          </button>
        </motion.div>
      )}

      {(expanded || isEditing) && (
        <motion.div
          exit={{ scaleY: 0.95, opacity: 0 }}
          initial={{ scaleY: 0.95, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: [0, 0.71, 0.2, 1.01] }}
          layout
          className=" w-full flex gap-2 min-h-20 pt-4"
        >
          {answerValues.map((answer, index) =>
            isEditing ? (
              <Textarea
                spellCheck={false}
                key={answer.id}
                value={answer.text}
                className="resize-none w-full rounded-lg text-base"
                onChange={(e) =>
                  setAnswerValues((prev) => {
                    const copy = [...prev];
                    copy[index].text = e.target.value;
                    return copy;
                  })
                }
                placeholder="Type your answer here."
                id="message"
              />
            ) : (
              <PushButton
                style={{ flex: "1 1 0px" }}
                offset={0}
                borderRadius="lg"
                disabled={!answer.correct}
                className={answer.correct ? "brightness-110" : ""}
                key={answer.id}
                color={
                  index === 0
                    ? "sky"
                    : index === 1
                      ? "green"
                      : index === 2
                        ? "fuchsia"
                        : "violet"
                }
              >
                <span className="flex items-center">
                  {answer.correct && <CheckIcon className="h-5 w-5" />}
                  {answer.text}
                </span>
              </PushButton>
            )
          )}
          {isEditing && (
            <button
              onClick={() => addAnswer(answers.length + 1)}
              className=" flex items-center justify-center"
            >
              <motion.span
                // initial={{ scale: 0, opacity: 0 }}
                // animate={{ scale: 1, opacity: 1 }}
                className="bg-[#242a32] rounded-full"
              >
                <PlusIcon className="h-4 w-4 " />
              </motion.span>
            </button>
          )}
        </motion.div>
      )}
    </Reorder.Item>
  );
};

const QuestionList = ({
  isEditing,
  questions,
  setQuestions,
  editingQuestion,
  setEditingQuestion,
  onNewQuestion,
  onDeleteQuestion,
  onSaveQuestion,
}: {
  isEditing: boolean;
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
  editingQuestion: string | null;
  setEditingQuestion: (id: string | null) => void;
  onSaveQuestion: (newQuestion: Question) => void;
  onNewQuestion: (index: number) => void;
  onDeleteQuestion: (index: number) => void;
}) => {
  return (
    <Reorder.Group
      as="ul"
      axis="y"
      values={questions}
      onReorder={setQuestions}
      className="flex flex-col  mx-auto  w-full max-w-6xl pt-4 gap-4 px-6"
    >
      <AnimatePresence mode="sync" initial={false}>
        <LayoutGroup>
          {questions.map((question, index) => {
            return (
              <QuestionItem
                key={question.id}
                value={question}
                id={question.id}
                {...question}
                isEditing={isEditing}
                handleSaveQuestion={onSaveQuestion}
                questionNumber={index + 1}
                isEditingQuiz={isEditing}
                index={index}
                handleDeleteQuestion={onDeleteQuestion}
                handleEditQuestion={setEditingQuestion}
              />
            );
          })}
        </LayoutGroup>
      </AnimatePresence>
      {isEditing && (
        <button
          onClick={() => onNewQuestion(questions.length + 1)}
          className="w-full flex items-center justify-center my-1"
        >
          <motion.span
            // initial={{ scale: 0, opacity: 0 }}
            // animate={{ scale: 1, opacity: 1 }}
            className="bg-[#242a32] p-1 rounded-full"
          >
            <PlusIcon className="h-4 w-4 " />
          </motion.span>
        </button>
      )}
    </Reorder.Group>
  );
};

export { QuestionList };
