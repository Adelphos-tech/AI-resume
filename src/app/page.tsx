import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col items-start justify-center gap-6 px-6 py-16">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">RoleRace</h1>
        <p className="text-sm text-muted-foreground">Design foundation</p>
      </div>

      <div className="flex gap-3">
        <Button>Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Career intelligence platform</CardTitle>
          <CardDescription>
            Temporary foundation page verifying the RoleRace design system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge>Foundation Ready</Badge>
        </CardContent>
      </Card>

      <Input type="email" placeholder="Email address" />
    </main>
  );
}
