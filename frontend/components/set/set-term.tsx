"use client";
import { NextPageContext, NextComponentType } from "next";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
interface SetTermProps {
  id: number;
  term: string;
  definition: string;
}
const SetTerm: NextComponentType<NextPageContext, {}, SetTermProps> = ({
  term,
  definition,
  id,
}) => {
  const [termValue, setTermValue] = useState(term);
  const [definitionValue, setDefinitionValue] = useState(definition);
  return (
    <form className="flex gap-3">
      <div className="grid w-full gap-1.5">
        <TextareaWithLabel
          value={termValue}
          onChange={(e) => setTermValue(e.target.value)}
          label="Term"
          placeholder="Type your term here."
        />
      </div>
      <div className="grid w-full gap-1.5">
        <TextareaWithLabel
          value={definitionValue}
          onChange={(e) => setDefinitionValue(e.target.value)}
          label="Definition"
          placeholder="Type your definition here."
        />
      </div>
    </form>
  );
};
export default SetTerm;

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
      <Label htmlFor="message">{label}</Label>
      <Textarea
        className="resize-none min-h-10 rounded-xl"
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
