import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Contact Sales</CardTitle>
          <CardDescription>
            Get in touch with our enterprise sales team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Contact form coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
