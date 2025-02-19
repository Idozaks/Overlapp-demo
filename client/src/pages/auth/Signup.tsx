import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function Signup() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>
            Create your Overlapp account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Sign up form coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
