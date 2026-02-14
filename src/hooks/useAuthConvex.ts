"use client";

import { useQuery, useMutation } from "convex/react";
import { useAuth } from "../contexts/AuthContext";
import { FunctionReference, FunctionArgs, FunctionReturnType } from "convex/server";

/**
 * Wrapper around useMutation that auto-injects sessionToken.
 * Usage: const doSomething = useAuthMutation(api.module.function);
 *        await doSomething({ otherArg: "value" });
 */
export function useAuthMutation<F extends FunctionReference<"mutation">>(
    mutationRef: F
) {
    const { sessionToken } = useAuth();
    const mutation = useMutation(mutationRef);

    return async (args?: Omit<FunctionArgs<F>, "sessionToken">) => {
        return mutation({ ...args, sessionToken: sessionToken ?? undefined } as any);
    };
}

/**
 * Wrapper around useQuery that auto-injects sessionToken.
 * Usage: const data = useAuthQuery(api.module.function, { otherArg: "value" });
 */
export function useAuthQuery<F extends FunctionReference<"query">>(
    queryRef: F,
    args?: Omit<FunctionArgs<F>, "sessionToken"> | "skip"
): FunctionReturnType<F> | undefined {
    const { sessionToken } = useAuth();

    const queryArgs = args === "skip" ? "skip" as const : {
        ...(args || {}),
        sessionToken: sessionToken ?? undefined,
    };

    return useQuery(queryRef, queryArgs as any);
}
