import { redirect } from "next/navigation";

export default function Home() {
  // Tech Mantra Judging System entrypoint.
  // We keep this as a server component and send users to the Auth entry route.
  redirect("/login");
}
