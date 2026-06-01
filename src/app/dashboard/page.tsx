import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard coming soon</h1>
      {email && <p className="mt-2 text-muted-foreground">{email}</p>}
    </div>
  );
}
