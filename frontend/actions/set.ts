"use server";
import prisma from "@/lib/db";
import {Prisma, Set, Term} from "@prisma/client";

export async function createSetWithTerms(
  setData: Prisma.SetCreateInput,
  newTerms: Prisma.TermCreateInput[],
  existingTermIds: number[]
) {
  const result = await prisma.$transaction(async (prisma) => {
    // Create new terms
    const createdTerms = await prisma.term.createMany({
      data: newTerms.map((term) => ({ ...term, ownerId: setData.ownerId })),
      skipDuplicates: true, // Skip if the term already exists
    });

    // Retrieve the IDs of the newly inserted terms
    const newTermIds = await prisma.term
      .findMany({
        where: {
          term: {
            in: newTerms.map((term) => term.term),
          },
          ownerId: setData.ownerId, // Ensure that we only get terms owned by the set owner
        },
        select: { id: true },
      })
      .then((terms) => terms.map((term) => term.id));

    // Combine new term IDs with existing term IDs
    const allTermIds = [...newTermIds, ...existingTermIds];

    // Insert the set and connect terms by their IDs
    const set = await prisma.set.create({
      data: {
        ...setData,
        terms: {
          connect: allTermIds.map((id) => ({ id })),
        },
      },
      include: {
        terms: true, // Include the term data in the return
      },
    });

    return set;
  });

  return result;
}




