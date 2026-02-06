import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

// Custom Password provider with profile fields (name, phone)
const CustomPassword = Password({
    profile(params) {
        return {
            email: params.email as string,
            name: params.name as string,
            phone: params.phone as string,
        };
    },
});

export const { auth, signIn, signOut, store } = convexAuth({
    providers: [CustomPassword],
});
