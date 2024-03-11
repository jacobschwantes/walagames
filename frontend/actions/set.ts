"use server";
import prisma from "@/lib/db";

const createSet = (formData: FormData) => {
  const rawFormData = {
    name: formData.get("name"),
    description: formData.get("descriptoin"),
    terms: formData.get("terms"),
  };

  return prisma.set.create({
    data: {
      ...rawFormData,
      terms: {
        create: {
          name: rawFormData.terms,
    },
   }
  });
};
