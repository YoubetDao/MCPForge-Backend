import NextAuth from "next-auth"
import { authConfig } from "@/auth"

// Create the NextAuth handler with our configuration
const handler = NextAuth(authConfig)

// Export the handler for GET and POST requests
export { handler as GET, handler as POST }
