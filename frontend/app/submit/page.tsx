import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authConfig } from "@/auth"
import SubmitForm from "@/components/submit-form"

export default async function SubmitServerPage() {
  const session = await getServerSession(authConfig)

  // 如果用户未登录，重定向到登录页面
  if (!session) {
    redirect("/auth/signin?callbackUrl=/submit")
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <SubmitForm userId={session.user?.id} />
    </div>
  )
}
