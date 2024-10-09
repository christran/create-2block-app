import { createAuthClient } from "better-auth/react"
import { env } from "@/env"
import { magicLinkClient, twoFactorClient, passkeyClient } from "better-auth/client/plugins";
import { toast } from "sonner";

export const client = createAuthClient({
    baseURL: env.NEXT_PUBLIC_APP_URL,
    plugins: [
        magicLinkClient(),
        twoFactorClient(),
        passkeyClient()
    ],
    fetchOptions: {
        onError: (e) => {   
            if (e.error.status === 429) {
                toast.error("Too many requests, please try again later.");
            }
        }
    }
})

export const {
	signUp,
	signIn,
	signOut,
	useSession,
	user,
	// organization,
	// useListOrganizations,
	// useActiveOrganization,
} = client;