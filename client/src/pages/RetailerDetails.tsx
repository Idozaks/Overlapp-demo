import { useParams } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function RetailerDetails() {
  const { id } = useParams();
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Retailer Details</CardTitle>
          <CardDescription>
            Retailer ID: {id}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Detailed retailer information coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
