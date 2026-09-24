"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

import { verifyCandidateSessionAction } from "../login/actions";
import { registerCandidateAction } from "./actions";

const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "Enter your first name.").max(80),
    lastName: z.string().trim().min(1, "Enter your last name.").max(80),
    email: z.email({ error: "Enter a valid email address." }),
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .max(128, "Use at most 128 characters."),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export function CandidateRegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: standardSchemaResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterValues) {
    setAuthError(null);

    try {
      const result = await registerCandidateAction(values);
      if (!result.success) {
        setAuthError(result.message);
        return;
      }

      // Sign in through the normal auth endpoint, then confirm the
      // session resolves to a CANDIDATE with owned Candidate.
      const { error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });
      if (error || !(await verifyCandidateSessionAction())) {
        await authClient.signOut();
        setAuthError("Unable to create an account. Please try again.");
        return;
      }
    } catch {
      setAuthError("Unable to create an account. Please try again.");
      return;
    }

    router.push("/candidate");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="mt-8 space-y-5"
    >
      {authError ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {authError}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            autoComplete="given-name"
            {...register("firstName")}
          />
          {errors.firstName ? (
            <p role="alert" className="text-sm text-red-600">
              {errors.firstName.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            autoComplete="family-name"
            {...register("lastName")}
          />
          {errors.lastName ? (
            <p role="alert" className="text-sm text-red-600">
              {errors.lastName.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email ? (
          <p role="alert" className="text-sm text-red-600">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            className="pr-10"
            {...register("password")}
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-stone-400 hover:text-stone-600"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {errors.password ? (
          <p role="alert" className="text-sm text-red-600">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword ? (
          <p role="alert" className="text-sm text-red-600">
            {errors.confirmPassword.message}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-emerald-700 hover:bg-emerald-800"
      >
        {isSubmitting ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
