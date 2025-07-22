import { useAtom } from "jotai"
import { userAtom } from "@/lib/atoms/user"

export function useUser() {
  const [user, setUser] = useAtom(userAtom)
  return {
    user,
    setUser,
    isLoggedIn: !!user,
  }
}