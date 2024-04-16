"use client";
import { Quiz } from "@/lib/types";
import { QuizHeader } from "./quiz-header";
import { QuestionList } from "./question-list";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { updateQuiz } from "@/actions/quiz";
import { uploadImage } from "@/actions/upload";
import { set } from "zod";
import { isEqual } from "lodash";
import { useRouter } from "next/navigation";
import { LayoutGroup } from "framer-motion";

interface QuizPageProps {
  initialData: Quiz;
}
export default function QuizPage({ initialData }: QuizPageProps) {
  const [quizData, setQuizData] = useState(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [questions, setQuestions] = useState(initialData.questions);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [imageData, setImageData] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [hasChanged, setHasChanged] = useState(false);
  const router = useRouter();
  const handleSaveQuiz = async () => {
    if (
      isEqual(quizData, {
        ...quizData,
        questions,
      }) &&
      imageData === null
    ) {
      console.log("No changes");
      setIsEditing(false);
      return;
    }
    const updatedQuiz = { meta: quizData.meta, questions };
    if (imageData) {
      console.log("Uploading image");
      const formData = new FormData();
      formData.append("file", imageData);

      const res = await uploadImage(formData);
      if (!res) {
        console.log("Error uploading image");
        return;
      }
      updatedQuiz.meta.image = res;
      setImageData(null);
    }

    console.log("Save quiz");
    const res = await updateQuiz(initialData.id, updatedQuiz);
    console.log(res);
    setIsEditing(false);
    const updatedQuizData = { ...quizData, updatedQuiz };
    setQuizData(updatedQuizData);
    // router.refresh();
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageData(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageDataUrl(e.target.result as string);
    };
    reader.readAsDataURL(file);
  };
  const handleNewQuestion = (index: number) => {
    console.log(questions);
    const id = uuidv4();
    setQuestions((prev) => {
      const copy = [...prev];
      copy.splice(index, 0, {
        id,
        question: "My question is...",
        answers: [{ id: uuidv4(), text: "My answer is...", correct: true }],
      });
      return copy;
    });
    setExpandedQuestion(id);
  };

  const handleDeleteQuestion = (index: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  };

  const handleSaveQuestion = (newQuestion) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const index = copy.findIndex((q) => q.id === newQuestion.id);
      copy[index] = newQuestion;
      return copy;
    });
    setEditingQuestion(null);
  };
  return (
    <>
      <LayoutGroup >
        <QuizHeader
          id={initialData.id}
          setImageColorData={(color) =>
            setQuizData((prev) => ({
              ...prev,
              meta: {
                ...prev.meta,
                image: {
                  ...prev.meta.image,
                  meta: {
                    color,
                  },
                },
              },
            }))
          }
          handleFileChange={handleFileChange}
          imageDataUrl={imageDataUrl}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          onSaveQuiz={handleSaveQuiz}
          {...initialData.meta}
        />
        <QuestionList
          questions={questions}
          setQuestions={setQuestions}
          isEditing={isEditing}
          onNewQuestion={handleNewQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onSaveQuestion={handleSaveQuestion}
          expandedQuestion={expandedQuestion}
          setExpandedQuestion={setExpandedQuestion}
          editingQuestion={editingQuestion}
          setEditingQuestion={setEditingQuestion}
        />
      </LayoutGroup>
    </>
  );
}
