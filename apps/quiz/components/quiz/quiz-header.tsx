"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ImagePlus, PencilLine, Save, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { deleteQuiz } from "@/actions/quiz";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuizContext } from "../providers/quiz-provider";
import {
  IconDeviceFloppy,
  IconEdit,
  IconPhotoUp,
  IconPlayerPlayFilled,
  IconSettings,
  IconTrash,
} from "@tabler/icons-react";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { useFormStatus } from "react-dom";

export function QuizHeader() {
  const { state, handleSaveQuestions } = useQuizContext();
  const { createLobby, lobbyState } = useLobbyContext();
  const params = useSearchParams();
  const router = useRouter();

  const isEditing = useMemo(() => params.get("edit") != null, [params]);

  const handleCreateLobby = async () => {
    if (lobbyState?.code) {
      router.push("/lobby");
      return;
    }
    try {
      await createLobby(state.quiz.id);
      router.push("/lobby");
    } catch (e) {
      toast(e.message);
    }
  };
  return (
    <>
      <motion.div
        layout="position"
        transition={{
          duration: 0.3,
          ease: [0, 0.71, 0.2, 1.01],
          restDelta: 1,
        }}
        className="w-full relative pt-6 "
      >
        <div className="grid grid-cols-2 items-start w-full  gap-12 absolute bottom-5 left-0 right-0 px-6 z-20">
          <div className="flex flex-col justify-between gap-0.5">
            <h2 className="text-3xl">{state.quiz.meta.title}</h2>
            <p className="text-zinc-200  text-sm capitalize">
              {state.quiz.meta.category}
            </p>
          </div>
        </div>
        <div className="relative w-full aspect-[16/6] rounded-t-xl overflow-hidden">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-blue-950 to-transparent opacity-80"></div>
          <Image
            objectFit="cover"
            alt="preview image"
            fill
            // TODO: set these sizes for performance
            // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            src={state.quiz.meta.image}
          />
        </div>
      </motion.div>
      <motion.div
        transition={{
          duration: 0.3,
          ease: [0, 0.71, 0.2, 1.01],
          restDelta: 1,
        }}
        layout="position"
        className="sticky top-0 z-50"
      >
        <div className=" p-3 flex gap-2 mx-auto max-w-6xl rounded-b-xl items-center  w-full justify-between  bg-[#242a32]">
          {/* <Link href={`/quiz/${state.quiz.id}?play`}> */}
          <Button
            onClick={handleCreateLobby}
            // size="sm"
            variant="action"
            className="gap-1 px-12"
          >
            <IconPlayerPlayFilled className="h-4 w-4" />
            Play
          </Button>
          {/* </Link> */}
          <div className="flex items-center  gap-1.5">
            {isEditing ? (
              <SaveQuizForm onSave={handleSaveQuestions} />
            ) : (
              <Button
                // size="sm"
                className="gap-1"
                onClick={() => router.push(`/quiz/${state.quiz.id}?edit`)}
                variant="outline"
              >
                <IconEdit className="h-4 w-4 text-violet-500" /> Edit
              </Button>
            )}
            <QuizSettingsDialog {...state.quiz.meta} />
            <DeleteQuizDialog id={state.quiz.id} />
          </div>
        </div>
      </motion.div>
    </>
  );
}

function DeleteQuizDialog({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button className="gap-1" variant="outline">
          <IconTrash className="h-4 w-4 text-red-500" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This quiz will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form
            action={async () => {
              await deleteQuiz(id).then(() => setOpen(false));
            }}
          >
            <Button variant="destructive" type="submit">
              Continue
            </Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const FormSchema = QuizMetaSchema;

import { z } from "zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import { Quiz, QuizMeta, QuizMetaSchema } from "@/lib/types";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormField,
  Form,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { set } from "lodash";
import { Toaster } from "../ui/sonner";
import { useLobbyContext } from "../providers/lobby-provider";
import { toast } from "sonner";

export function QuizSettingsDialog(meta: QuizMeta) {
  const { handleSaveMeta } = useQuizContext();
  const [open, setOpen] = useState(false);
  const hiddenFileInput = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    hiddenFileInput.current && hiddenFileInput.current.click();
  };

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<File | null>(null);
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      image: meta.image,
      title: meta.title,
      visibility: meta.visibility,
      category: meta.category,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (!file) return;
    setImageData(file);
    // dispatch({ type: "SET_IMAGE_DATA", payload: file });
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target) return;
      setImagePreview(e.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  const categories = [
    "Science",
    "History",
    "Culture",
    "Sports",
    "Geography",
    "Music",
    "Technology",
    "Nature",
    "Entertainment",
    "Food",
  ];

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);
    await handleSaveMeta(data, imageData);
    setOpen(false);
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1" variant="outline">
          <IconSettings className="h-4 w-4 text-yellow-500" /> Settings
        </Button>
      </DialogTrigger>

      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className=" gap-6 sm:max-w-3xl"
      >
        <DialogHeader>
          <DialogTitle>Quiz settings</DialogTitle>
          <DialogDescription>
            Make changes to your quiz here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4"
          >
            <div className="flex flex-col h-full justify-between">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    {/* <FormDescription>
                    This is your public display name.
                  </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {categories.map((category) => (
                              <SelectItem
                                key={category}
                                value={category.toLowerCase()}
                              >
                                {category}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    {/* <FormDescription>
                    This is your public display name.
                  </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    {/* <FormDescription>
                    This is your public display name.
                  </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="h-full  w-full flex flex-col gap-1.5 ">
              <img
                className="rounded-[var(--radius)] aspect-[16/9] w-full object-cover"
                src={imagePreview ?? meta.image}
                alt="preview"
              />
              <Controller
                name="image"
                control={form.control}
                render={({ field: { ref, name, onBlur, onChange } }) => (
                  <div className="">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={handleClick}
                      className="gap-1"
                    >
                      <IconPhotoUp className="h-4 w-4 text-yellow-500 " />
                      Upload
                    </Button>

                    <input
                      ref={hiddenFileInput}
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*"
                      type="file"
                      id="file"
                      name="file"
                    />
                  </div>
                )}
              />
            </div>
            <DialogFooter className="col-span-2">
              <Button variant="action" type="submit">
                {form.formState.isSubmitting ? (
                  <span className="flex items-center gap-0.5">
                    <motion.span layout className="loader h-3 w-3 mr-0.5 " />
                    Saving
                  </span>
                ) : (
                  "Save changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function SaveQuizButton() {
  const { pending } = useFormStatus();
  return (
    <Button variant="outline" className="gap-1">
      {pending ? (
        <motion.span layout className="loader h-3 w-3 mr-0.5 " />
      ) : (
        <IconDeviceFloppy className="h-4 w-4 text-violet-500" />
      )}
      {pending ? "Saving" : "Save"}{" "}
    </Button>
  );
}

export function SaveQuizForm({ onSave }: { onSave: () => void }) {
  return (
    <form action={onSave}>
      <SaveQuizButton />
    </form>
  );
}
