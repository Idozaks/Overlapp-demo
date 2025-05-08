import { FC, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Loader2,
  Share2,
  BookmarkIcon,
  SparklesIcon,
  MessageCircleIcon,
  MapPinIcon,
  InfoIcon,
  QrCodeIcon,
  ClipboardIcon,
  LucideImageOff
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ObjectAnalysis {
  type: string;
  description: string;
  relevantInterests: string[];
  suggestedActions: string[];
  relatedContent?: string[];
}

const SignObject: FC = () => {
  const [activeTab, setActiveTab] = useState<string>("camera");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [textInput, setTextInput] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisOpen, setAnalysisOpen] = useState<boolean>(false);
  const [objectAnalysis, setObjectAnalysis] = useState<ObjectAnalysis | null>(null);
  const { toast } = useToast();
  
  // Analysis mutation
  const analyzeObject = useMutation({
    mutationFn: async (data: { image?: string, text?: string }) => {
      try {
        setIsAnalyzing(true);
        console.log("Sending object analysis request");
        
        const response = await apiRequest('/api/objects/analyze', {
          method: 'POST',
          body: data
        });
        
        console.log("Object analysis response:", response);
        return response as ObjectAnalysis;
      } catch (error) {
        console.error("Object analysis error:", error);
        throw error;
      } finally {
        setIsAnalyzing(false);
      }
    },
    onSuccess: (data) => {
      setObjectAnalysis(data);
      setAnalysisOpen(true);
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Could not analyze the object",
        variant: "destructive"
      });
    }
  });
  
  // Simulated camera capture function
  const captureImage = () => {
    // In a real implementation, this would use the device camera
    toast({
      title: "Camera simulation",
      description: "In a real implementation, this would access your device camera",
    });
    
    // Simulate a captured image (placeholder for demo)
    const mockCapturedImageUrl = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200' width='300' height='200'><rect width='300' height='200' fill='%23f0f0f0'/><text x='50%' y='50%' font-family='Arial' font-size='18' text-anchor='middle' fill='%23666'>Captured Image</text></svg>";
    setCapturedImage(mockCapturedImageUrl);
  };
  
  // Simulated file upload function
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Read the file as a data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle OCR text input analysis
  const analyzeText = () => {
    if (!textInput.trim()) {
      toast({
        title: "Input required",
        description: "Please enter text to analyze",
        variant: "destructive"
      });
      return;
    }
    
    analyzeObject.mutate({ text: textInput });
  };
  
  // Handle image analysis
  const analyzeImage = () => {
    if (!capturedImage) {
      toast({
        title: "Image required",
        description: "Please capture or upload an image first",
        variant: "destructive"
      });
      return;
    }
    
    analyzeObject.mutate({ image: capturedImage });
  };
  
  // Clear the current input
  const clearInput = () => {
    if (activeTab === "text") {
      setTextInput("");
    } else {
      setCapturedImage(null);
    }
  };
  
  // Simulated recent analysis history
  const recentAnalyses = [
    {
      id: 1,
      type: "QR Code",
      description: "Conference Badge QR Code",
      timestamp: "2 hours ago",
      thumbnail: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' fill='%23f0f0f0'/><rect x='20' y='20' width='60' height='60' fill='%23333'/></svg>",
    },
    {
      id: 2,
      type: "Sign",
      description: "Museum Exhibit Information",
      timestamp: "Yesterday",
      thumbnail: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' fill='%23f0f0f0'/><text x='50%' y='50%' font-family='Arial' font-size='10' text-anchor='middle' fill='%23333'>Museum Sign</text></svg>",
    },
    {
      id: 3,
      type: "Product",
      description: "Organic Coffee Package",
      timestamp: "3 days ago",
      thumbnail: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' fill='%23f0f0f0'/><circle cx='50' cy='50' r='30' fill='%23996633'/></svg>",
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Analyze Signs & Objects</h1>
        <p className="text-muted-foreground mb-6">
          Capture or upload images of signs, QR codes, or objects to analyze their content and relevance
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="camera">
            <Camera className="w-4 h-4 mr-2" />
            Camera
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="text">
            <ClipboardIcon className="w-4 h-4 mr-2" />
            Text OCR
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="camera" className="space-y-4">
          <div className="flex flex-col items-center">
            {capturedImage ? (
              <div className="relative w-full max-w-md border rounded-lg overflow-hidden mb-4">
                <img 
                  src={capturedImage} 
                  alt="Captured" 
                  className="w-full h-64 object-cover"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="absolute top-2 right-2 bg-background/80"
                  onClick={clearInput}
                >
                  Clear
                </Button>
              </div>
            ) : (
              <div className="w-full max-w-md h-64 bg-muted rounded-lg mb-4 flex flex-col items-center justify-center">
                <LucideImageOff className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No image captured</p>
              </div>
            )}
            
            <div className="flex gap-4">
              {!capturedImage ? (
                <Button onClick={captureImage}>
                  <Camera className="w-4 h-4 mr-2" />
                  Capture Image
                </Button>
              ) : (
                <Button onClick={analyzeImage} disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing</>
                  ) : (
                    <><SparklesIcon className="w-4 h-4 mr-2" /> Analyze</>
                  )}
                </Button>
              )}
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground text-center">
            Point your camera at signs, QR codes, or objects to analyze them
          </div>
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-4">
          <div className="flex flex-col items-center">
            {capturedImage ? (
              <div className="relative w-full max-w-md border rounded-lg overflow-hidden mb-4">
                <img 
                  src={capturedImage} 
                  alt="Uploaded" 
                  className="w-full h-64 object-cover"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="absolute top-2 right-2 bg-background/80"
                  onClick={clearInput}
                >
                  Clear
                </Button>
              </div>
            ) : (
              <div className="w-full max-w-md h-64 bg-muted rounded-lg mb-4 flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25">
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">Upload an image</p>
                <p className="text-xs text-muted-foreground/70">Supported formats: JPG, PNG, GIF</p>
              </div>
            )}
            
            <div className="flex gap-4">
              {!capturedImage ? (
                <Label className="cursor-pointer">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileUpload}
                  />
                  <div className="flex items-center justify-center h-10 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
                    <Upload className="w-4 h-4 mr-2" />
                    Select File
                  </div>
                </Label>
              ) : (
                <Button onClick={analyzeImage} disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing</>
                  ) : (
                    <><SparklesIcon className="w-4 h-4 mr-2" /> Analyze</>
                  )}
                </Button>
              )}
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground text-center">
            Upload images of signs, QR codes, or objects to analyze them
          </div>
        </TabsContent>
        
        <TabsContent value="text" className="space-y-4">
          <div className="flex flex-col">
            <Label htmlFor="ocr-text" className="mb-2">Enter Text from Sign or Object</Label>
            <Textarea 
              id="ocr-text"
              placeholder="Enter text from a sign, label, or object here..."
              className="h-40 mb-4"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
            
            <div className="flex gap-4">
              <Button 
                onClick={analyzeText} 
                disabled={isAnalyzing || !textInput.trim()}
              >
                {isAnalyzing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing</>
                ) : (
                  <><SparklesIcon className="w-4 h-4 mr-2" /> Analyze Text</>
                )}
              </Button>
              
              {textInput && (
                <Button variant="outline" onClick={clearInput}>
                  Clear
                </Button>
              )}
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground text-center">
            Manually enter text from signs, labels, or objects when image capture isn't possible
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Recent Analyses</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentAnalyses.map((analysis) => (
            <Card key={analysis.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="grid grid-cols-[100px_1fr] h-full">
                  <div className="bg-muted overflow-hidden">
                    <img 
                      src={analysis.thumbnail} 
                      alt={analysis.description} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline">{analysis.type}</Badge>
                      <span className="text-xs text-muted-foreground">{analysis.timestamp}</span>
                    </div>
                    
                    <h3 className="font-medium mb-2">{analysis.description}</h3>
                    
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="ghost">
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                      <Button size="sm" variant="ghost">
                        <BookmarkIcon className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Analysis Dialog */}
      <Dialog open={analysisOpen} onOpenChange={setAnalysisOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-primary" />
              Object Analysis
            </DialogTitle>
            <DialogDescription>
              Analysis results and relevance to your interests
            </DialogDescription>
          </DialogHeader>
          
          {objectAnalysis && (
            <div className="space-y-4 my-2 overflow-y-auto pr-2 flex-grow">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Object Type</span>
                  <Badge>{objectAnalysis.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground break-words">
                  {objectAnalysis.description}
                </p>
              </div>
              
              {/* Relevant Interests */}
              {objectAnalysis.relevantInterests && objectAnalysis.relevantInterests.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Relevant to Your Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {objectAnalysis.relevantInterests.map((interest, i) => (
                      <Badge key={i} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Suggested Actions */}
              {objectAnalysis.suggestedActions && objectAnalysis.suggestedActions.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Suggested Actions</h3>
                  <ul className="space-y-2">
                    {objectAnalysis.suggestedActions.map((action, i) => (
                      <li key={i} className="text-sm flex gap-2">
                        <MessageCircleIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="break-words">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Related Content */}
              {objectAnalysis.relatedContent && objectAnalysis.relatedContent.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Related Content</h3>
                  <ul className="space-y-1">
                    {objectAnalysis.relatedContent.map((content, i) => (
                      <li key={i} className="text-sm break-words">• {content}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex-shrink-0 mt-2 pt-2 border-t">
            <Button className="w-full" onClick={() => setAnalysisOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SignObject;