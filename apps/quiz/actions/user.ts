"use server";

type UserProfile = {
  id: string;
  name: string;
  image: string;
};
type SuccessResponse = {
  data: { [id: string]: UserProfile };
};
type ErrorResponse = {
  error: string;
};
type UserResponse = ErrorResponse | SuccessResponse;

export async function fetchUserProfilesByIds(
  ids: string[]
): Promise<UserResponse> {
  console.log(ids);
  const res = await fetch(process.env.FUSIONAUTH_URL + "/api/user/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: process.env.FUSIONAUTH_API_KEY || "",
    },
    body: JSON.stringify({
      search: {
        ids,
      },
    }),
  });

  const data = await res.json();

  if (!data.total) {
    console.error(data);
    return { error: "Failed to lookup users" };
  }

  const users: { [id: string]: UserProfile } = {};

  for (let i = 0; i < data.total; i++) {
    const user = data.users[i];

    users[user.id] = {
      id: user.id,
      name: user.fullName,
      image: user.imageUrl,
    };
  }

  return { data: users };
}
