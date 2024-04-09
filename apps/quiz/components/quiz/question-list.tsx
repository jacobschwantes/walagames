"use client";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { v4 as uuidv4 } from "uuid";
import { AnimatePresence, Reorder } from "framer-motion";

import {
  Maximize2,
  Minimize2,
  Pencil,
  PlusIcon,
  Save,
  TrashIcon,
} from "lucide-react";
import type { Question } from "@/lib/types";
import { motion } from "framer-motion";
import { PushButton } from "../ui/custom-button";
import { CheckIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "../ui/input";

const QuestionItem = ({
  id,
  question,
  answers,
  questionNumber,
  isEditingQuiz,
  isEditingQuestion,
  isExpanded,
  handleDeleteQuestion,
  handleEditQuestion,
  handleSaveQuestion,
  setExpanded,
  index,
}: Question & {
  questionNumber: number;
  isEditingQuiz: boolean;
  isEditingQuestion: boolean;
  isExpanded: boolean;

  index: number;
  handleDeleteQuestion: (index: number) => void;
  handleEditQuestion: (id: string | null) => void;
  setExpanded: (id: string | null) => void;
  handleSaveQuestion: (newQuestion) => void;
}) => {
  const [questionValue, setQuestionValue] = useState(question);
  const [answerValues, setAnswerValues] = useState(answers);

  const saveQuestion = () => {
    handleSaveQuestion({
      id,
      question: questionValue,
      answers: answerValues,
    });
  }
  return (
    <div className="flex flex-col bg-[#242a32] p-4 rounded-xl gap-3 overflow-hidden">
      <motion.div layout className="flex justify-between items-center  p-2">
        {isEditingQuestion ? (
          <Input
            value={questionValue}
            onChange={(e) => setQuestionValue(e.target.value)}
          />
        ) : (
          <h2 className={cn("text-xl")}>{question}</h2>
        )}
        {isEditingQuiz && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleDeleteQuestion(index)}
              className="btn-primary ml-auto "
            >
              <TrashIcon className="h-4 w-4" />
            </button>

            {isEditingQuestion ? (
              <button onClick={saveQuestion} className="btn-primary ml-auto">
                <Save className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() =>
                  handleEditQuestion(isEditingQuestion ? null : id)
                }
                className="btn-primary ml-auto "
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        {!isEditingQuiz &&
          (isExpanded ? (
            <button
              className="text-zinc-300 hover:text-white transition-colors duration-200 items-center jusitfy-center flex"
              onClick={() => setExpanded(null)}
            >
              <Minimize2 className="h-5 w-5" />
            </button>
          ) : (
            <button
              className="text-zinc-300 hover:text-white transition-colors duration-200 flex items-center justify-center"
              onClick={() => setExpanded(id)}
            >
              <Maximize2 className="h-5 w-5" />
            </button>
          ))}
      </motion.div>

      {/* <Input
        id={`question-${questionNumber}`}
        value={questionValue}
        onChange={(e) => setQuestionValue(e.target.value)}
        placeholder="Type your term here."
      /> */}

      {(isExpanded || isEditingQuestion) && (
        <motion.div
          exit={{ scaleY: 0.95, opacity: 0 }}
          initial={{ scaleY: 0.95, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: [0, 0.71, 0.2, 1.01] }}
          layout
          className="grid grid-cols-4 w-full gap-2 h-16"
        >
          {answerValues.map((answer, index) =>
            isEditingQuestion ? (
              <TextareaWithLabel
                key={answer.id}
                value={answer.text}
                onChange={(e) =>
                  setAnswerValues((prev) => {
                    const copy = [...prev];
                    copy[index].text = e.target.value;
                    return copy;
                  })
                }
                label={`Answer ${index + 1}`}
                placeholder="Type your answer here."
              />
            ) : (
              <PushButton
                offset={0}
                borderRadius="lg"
                disabled={!answer.correct}
                className={answer.correct ? "brightness-110" : "  scale-y-95"}
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
        </motion.div>
      )}
    </div>
  );
};

const QuestionList = ({
  isEditing,
  questions,
  setQuestions,
  expandedQuestion,
  setExpandedQuestion,
  editingQuestion,
  setEditingQuestion,
  onNewQuestion,
  onDeleteQuestion,
  onSaveQuestion,
}: {
  isEditing: boolean;
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
  expandedQuestion: string | null;
  setExpandedQuestion: (id: string | null) => void;
  editingQuestion: string | null;
  setEditingQuestion: (id: string | null) => void;
  onSaveQuestion: (newQuestion: Question) => void;
  onNewQuestion: (index: number) => void;
  onDeleteQuestion: (index: number) => void;
}) => {
  return (
    <Reorder.Group
      layoutScroll
      layout
      as="ul"
      axis="y"
      values={questions}
      onReorder={setQuestions}
      className="flex flex-col  mx-auto  w-full max-w-6xl pt-4 gap-4 px-6"
    >
      <AnimatePresence mode="sync" initial={false}>
        {questions.map((question, index) => {
          const isExpanded = expandedQuestion === question.id;
          const isEditingQuestion = editingQuestion === question.id;
          return (
            <Reorder.Item
              dragListener={isEditing}
              draggable={isEditing}
              whileTap={
                isEditing
                  ? { cursor: "grabbing", scale: 1.03, zIndex: 1000 }
                  : {}
              }
              as="li"
              value={question}
              className={cn("flex flex-col group relative")}
              initial={{ scale: 0.7, opacity: 0 }}
              exit={{
                scale: 0.9,
                opacity: 0,
                transition: { duration: 0.1, restDelta: 0.7 },
              }}
              animate={{
                scale: 1,
                opacity: 1,
                transition: { duration: 0.3, ease: [0, 0.71, 0.2, 1.01] },
              }}
              transition={{
                duration: 0.3,
                ease: [0, 0.71, 0.2, 1.01],
              }}
              key={question.id}
            >
              <QuestionItem
                {...question}
                handleSaveQuestion={onSaveQuestion}
                questionNumber={index + 1}
                isExpanded={isExpanded}
                isEditingQuiz={isEditing}
                isEditingQuestion={isEditingQuestion}
                index={index}
                handleDeleteQuestion={onDeleteQuestion}
                handleEditQuestion={setEditingQuestion}
                setExpanded={setExpandedQuestion}
              />
            </Reorder.Item>
          );
        })}
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

interface TextareaWithLabelProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}
export function TextareaWithLabel({
  label,
  placeholder,
  value,
  onChange,
}: TextareaWithLabelProps) {
  return (
    <div className="grid w-full gap-1.5">
      {/* <Label htmlFor="message">{label}</Label> */}
      <Textarea
        className="resize-none min-h-10 rounded-xl bg-[#1a1e24]"
        onChange={onChange}
        value={value}
        placeholder={placeholder}
        id="message"
      />
    </div>
  );
}

// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";

// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Textarea } from "@/components/ui/textarea";
// import { toast } from "@/components/ui/use-toast";

// const FormSchema = z.object({
//   bio: z
//     .string()
//     .min(10, {
//       message: "Bio must be at least 10 characters.",
//     })
//     .max(160, {
//       message: "Bio must not be longer than 30 characters.",
//     }),
// });

// export function TextareaForm() {
//   const form = useForm<z.infer<typeof FormSchema>>({
//     resolver: zodResolver(FormSchema),
//   });

//   function onSubmit(data: z.infer<typeof FormSchema>) {
//     toast({
//       title: "You submitted the following values:",
//       description: (
//         <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
//           <code className="text-white">{JSON.stringify(data, null, 2)}</code>
//         </pre>
//       ),
//     });
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
//         <FormField
//           control={form.control}
//           name="bio"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Bio</FormLabel>
//               <FormControl>
//                 <Textarea
//                   placeholder="Tell us a little bit about yourself"
//                   className="resize-none"
//                   {...field}
//                 />
//               </FormControl>
//               <FormDescription>
//                 You can <span>@mention</span> other users and organizations.
//               </FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <Button type="submit">Submit</Button>
//       </form>
//     </Form>
//   );
// }
