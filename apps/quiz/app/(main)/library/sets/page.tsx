import { authOptions } from "@/auth";
import { Set, Term } from "@/lib/types";
import { getServerSession } from "next-auth";
export default async function Page() {
  const session = await getServerSession(authOptions);
  console.log(session);
  const sessionToken = session.sessionToken;

  const sets = await fetch("http://localhost:8081/sets", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("data:", data);
      return data || [];
    })
    .catch((e) => {
      console.error(e);
      return [];
    });

  return (
    <div>
      <h1>Sets</h1>
      <ul>
        {sets.map((set: Set) => (
          <li key={set.id}>
            <h2>{set.name}</h2>
            <p>{set.description}</p>
            <ul className="flex flex-col">
              {set.terms.map((term: Term) => (
                <li key={term.id}>
                  {term.term} - {term.definition}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

