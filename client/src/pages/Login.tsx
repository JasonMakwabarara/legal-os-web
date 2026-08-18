import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_EMAIL, DEMO_PASSWORD, isDemoMode } from "@/lib/demo-mode";
import { trpc } from "@/lib/trpc";
import type { FormEvent } from "react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [email, setEmail] = useState(isDemoMode() ? DEMO_EMAIL : "superadmin@legalos.local");
  const [password, setPassword] = useState(isDemoMode() ? DEMO_PASSWORD : "");
  const [error, setError] = useState<string | null>(null);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async user => {
      utils.auth.me.setData(undefined, user);
      await utils.auth.me.invalidate();
      setLocation(user.firmId ? "/dashboard" : "/firm-setup");
    },
    onError: err => {
      setError(err.message || "Unable to sign in");
    },
  });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await loginMutation.mutateAsync({ email, password });
    } catch {
      // Error state is set by the mutation callback.
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/80 text-white shadow-2xl shadow-cyan-950/30">
        <CardHeader>
          <CardTitle className="text-2xl">Sign in to Legal OS</CardTitle>
          <CardDescription className="text-slate-400">
            {isDemoMode()
              ? `Demo login is prefilled: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`
              : "Use your local Legal OS account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={submit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={event => setEmail(event.target.value)}
                className="border-slate-700 bg-slate-950 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                className="border-slate-700 bg-slate-950 text-white"
                required
              />
            </div>

            {error && <p className="text-sm text-red-300">{error}</p>}

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
