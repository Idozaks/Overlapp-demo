import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function Demo() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Interactive Demo</CardTitle>
          <CardDescription>
            Experience Overlapp's features firsthand
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Interactive demo coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
