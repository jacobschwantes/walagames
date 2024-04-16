"use client";
import * as React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { PushButton, SaveButton } from "../ui/custom-button";
import { Pencil1Icon } from "@radix-ui/react-icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ChevronRight,
  ImagePlus,
  Pencil,
  PencilLine,
  Save,
  Trash,
  UploadIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { uploadImage } from "@/actions/upload";
import ColorThief from "colorthief";
import { Button } from "../ui/button";
import { deleteQuiz } from "@/actions/quiz";
import Link from "next/link";

// wrench icon
{
  /* <svg
                className="h-3 w-3 text-white"
                fill="currentColor"
                viewBox="3 3 42 42"
              >
                <path d="m33.76001,25.02997c-.92999-.92999-1.32001-2.26996-1.04999-3.58997,1-4.79999-.48004-9.73004-3.95001-13.19-4.16003-4.16003-10.35004-5.40002-15.79004-3.15002-.31.13-.53998.40002-.59998.72998-.07001.33002.03998.67004.27002.90002l5.70001,5.70001c.78998.78998,1.22998,1.83997,1.22998,2.96002,0,1.10999-.44,2.15997-1.22998,2.94995-1.63,1.63-4.28003,1.63-5.91003,0l-5.70001-5.69995c-.23999-.23004-.57001-.34003-.89996-.27002-.33002.06-.60004.28998-.73004.59998-2.25,5.42999-1.00995,11.63,3.15002,15.79004,3.46002,3.46997,8.39001,4.94,13.19,3.94995,1.32001-.26996,2.65997.12,3.59003,1.05005l8.41998,8.42999c1.20996,1.20996,2.78998,1.81,4.37,1.81s3.16998-.60999,4.37-1.81c1.16998-1.17004,1.81-2.72003,1.81-4.37s-.64001-3.20001-1.81-4.37l-8.42999-8.42004Z" />
              </svg> */
}

interface QuizHeaderProps {
  title: string;
  category: string;
  description: string;
  image: {
    src: string;
    meta: {
      colorHex: string;
      colorRGBA: string;
      isDark: boolean;
    };
  };
  id: string;
  isEditing: boolean;
  setImageColorData: (color: { r: number; g: number; b: number }) => void;
  setIsEditing: (isEditing: boolean) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imageDataUrl: string | null;
  onSaveQuiz: () => void;
}
const QuizHeader = ({
  title,
  category,
  id,
  description,
  image,
  isEditing,
  setIsEditing,
  onSaveQuiz,
  handleFileChange,
  setImageColorData,
  imageDataUrl,
}: QuizHeaderProps) => {
  // const router = useRouter();
  // const handleEdit = () => {
  //   router.push("?edit");
  // };
  const imgRef = React.useRef();

  return (
    <>
      <motion.div
        layout="position"
        transition={{
          duration: 0.3,
          ease: [0, 0.71, 0.2, 1.01],
          restDelta: 1,
        }}
        className="w-full relative pt-6 px-6"
      >
        <div className="grid grid-cols-2 items-start w-full  gap-12 absolute bottom-5 left-0 right-0 px-12 z-20">
          <div className="flex flex-col justify-between gap-0.5">
            <h2 className="text-3xl">{title}</h2>
            <p className="text-zinc-200  text-sm">{category}</p>
          </div>
          {/* <div className="flex gap-2 max-w-smt ml-auto">
            <p className=" text-sm font-light">{description}</p>
          </div> */}
        </div>
        <div className="relative w-full aspect-[16/6] rounded-t-xl overflow-hidden">
          {isEditing && (
            <div className="absolute top-5 right-5 z-50">
              <label htmlFor="file">
                <ImagePlus className="h-5 w-5 text-white " />
              </label>
              <input
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
                type="file"
                id="file"
                name="file"
              />
            </div>
          )}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-blue-950 to-transparent opacity-80"></div>
          <Image
            objectFit="cover"
            alt="preview image"
            fill
            // ref={imgRef}
            // onLoad={() => {
            //   const colorThief = new ColorThief();
            //   const img = imgRef.current;
            //   const color = colorThief.getColor(img);
            //   const colorObj = {
            //     r: color[0],
            //     g: color[1],
            //     b: color[2],
            //   };
            //   console.log(color);
            //   setImageColorData(colorObj);
            // }}
            // TODO: set these sizes for performance
            // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            src={imageDataUrl ?? image.src}
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
        className="px-6 sticky top-0 z-50"
      >
        <div className=" p-3 flex gap-2 mx-auto max-w-6xl rounded-b-xl items-center  w-full justify-between  bg-[#242a32] px-6">
          <div className="flex items-center gap-2">
            <Link href={`/lobby?id=${id}`}>
              <Button
                // size="lg"
                variant="sky"
                className=" flex gap-1 items-center px-12"
              >
                <svg
                  className="h-[.65rem] w-[.65rem] text-white"
                  viewBox="0 0 448 512"
                >
                  <path
                    fill="currentColor"
                    d="m424.4 214.7-352-208.1c-28.6-16.9-72.4-.5-72.4 41.3v416.1c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"
                  />
                </svg>
                {/* <span className="p-0.5 rounded-full bg-sky-300/30 mr-1">
                <ChevronRight className="h-3 w-3" />
              </span> */}
                Play
              </Button>
            </Link>
            {isEditing ? (
              <form action={onSaveQuiz}>
                <SaveButton />
              </form>
            ) : (
              <Button
                // size="lg"
                className=""
                onClick={() => setIsEditing(!isEditing)}
                variant="violet"
              >
                <span className="mr-1">
                  <PencilLine className="h-4 w-4" />
                  {/* <PlusIcon className="h-3 w-3" /> */}
                </span>
                Edit
              </Button>
            )}
            <DeleteDialog id={id} />
          </div>
        </div>
      </motion.div>
    </>
  );
};

export { QuizHeader, DeleteDialog };

function DeleteDialog({ id }) {
  const [open, setOpen] = React.useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button className="flex gap-1" variant="destructive">
          <span className="">
            <Trash className="h-4 w-4" />
          </span>
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
            <Button type="submit">Continue</Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
