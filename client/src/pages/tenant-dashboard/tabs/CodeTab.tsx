import React, { useState } from 'react';
import { Tenant, TenantProfile } from '@shared/schema';
import { Check, Copy, Code2, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface CodeTabProps {
  tenant: Tenant;
  profile: TenantProfile | null | undefined;
}

const CodeTab: React.FC<CodeTabProps> = ({ tenant, profile }) => {
  const [activeTab, setActiveTab] = useState<string>('script');
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({
    script: false,
    react: false,
    iframe: false,
  });
  const { toast } = useToast();

  // Generate the script tag code
  const generateScriptCode = () => {
    return `<script
  src="${window.location.origin}/widget/init.js"
  data-tenant-id="${tenant.tenantId}"
  data-position="${tenant.settings?.appearance?.position || 'bottom-right'}"
  data-theme="${tenant.settings?.appearance?.theme || 'light'}"
></script>`;
  };

  // Generate the React component code
  const generateReactCode = () => {
    return `// First, install the widget package
// npm install @overlapp/widget-react

import { OverlapWidget } from '@overlapp/widget-react';

function App() {
  return (
    <div>
      {/* Your app content */}
      
      <OverlapWidget 
        tenantId="${tenant.tenantId}"
        position="${tenant.settings?.appearance?.position || 'bottom-right'}"
        theme="${tenant.settings?.appearance?.theme || 'light'}"
      />
    </div>
  );
}`;
  };

  // Generate the iframe code
  const generateIframeCode = () => {
    return `<iframe
  src="${window.location.origin}/widget/embed/${tenant.tenantId}"
  width="100%"
  height="600"
  frameborder="0"
  allow="clipboard-write"
></iframe>`;
  };

  // Copy code to clipboard
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied({ ...copied, [type]: true });
        toast({
          title: 'Copied!',
          description: 'Code copied to clipboard',
        });
        
        // Reset copied state after 2 seconds
        setTimeout(() => {
          setCopied({ ...copied, [type]: false });
        }, 2000);
      },
      (err) => {
        toast({
          title: 'Copy failed',
          description: 'Could not copy text: ' + err,
          variant: 'destructive',
        });
      }
    );
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Integration Code</h1>
          <p className="text-muted-foreground">
            Add the OverlapLite Widget to your website
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <a 
            href={`/tenant/preview/${tenant.tenantId}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Button variant="outline" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Preview Widget
            </Button>
          </a>
        </div>
      </div>

      {!profile ? (
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile First</CardTitle>
            <CardDescription>
              You need to set up your community profile before you can add the widget to your website.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-muted rounded-lg text-center">
              <p className="mb-4">
                Please go to the "Community Profile" tab and complete your profile.
                This will ensure that visitors can see your community's interests and information.
              </p>
              <Button onClick={() => document.querySelector('[value="profile"]')?.dispatchEvent(new Event('click'))}>
                Go to Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Integration Methods</CardTitle>
              <CardDescription>
                Choose the method that works best for your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="script" className="flex items-center gap-2">
                    <Code2 className="h-4 w-4" />
                    Script Tag
                  </TabsTrigger>
                  <TabsTrigger value="react" className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <path d="M12 13.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
                      <path d="M12 22.5c-5.799 0-10.5-2.457-10.5-5.5 0-1.95 1.915-3.692 4.966-4.74C4.97 11.188 3.5 9.639 3.5 8c0-2.729 4.253-5 8.5-5s8.5 2.271 8.5 5c0 1.639-1.47 3.188-2.966 4.26C20.585 13.308 22.5 15.05 22.5 17c0 3.043-4.701 5.5-10.5 5.5Zm-7.948-6.998C2.275 16.359 1.5 17.359 1.5 18c0 2.333 4.701 4.5 8.5 4.5s8.5-2.167 8.5-4.5c0-.74-.95-1.694-2.552-2.498-.48.054-.968.081-1.448.081a14.938 14.938 0 0 1-8.099-2.396c-.968-.679-1.466-1.539-1.349-2.185ZM12 4c-3.799 0-6.5 1.833-6.5 4 0 1.527 1.531 2.649 3.955 3.308a2.984 2.984 0 0 0 1.045-1.308 3.857 3.857 0 0 0-.248-3.519c.541-.236 1.164-.481 1.748-.481.584 0 1.207.245 1.748.481a3.857 3.857 0 0 0-.248 3.519 2.984 2.984 0 0 0 1.045 1.308C16.969 10.649 18.5 9.527 18.5 8c0-2.167-2.701-4-6.5-4Z" />
                    </svg>
                    React Component
                  </TabsTrigger>
                  <TabsTrigger value="iframe" className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                      <rect x="2" y="2" width="20" height="20" rx="2" />
                      <line x1="2" y1="8" x2="22" y2="8" />
                      <line x1="8" y1="2" x2="8" y2="22" />
                    </svg>
                    Iframe Embed
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="script">
                  <div className="space-y-4">
                    <p>
                      Add this script tag to your website's HTML, ideally right before the closing <code>&lt;/body&gt;</code> tag:
                    </p>
                    <div className="relative">
                      <pre className="p-4 rounded-lg bg-muted overflow-x-auto text-sm">
                        <code>{generateScriptCode()}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(generateScriptCode(), 'script')}
                      >
                        {copied.script ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium mb-1">How it works:</p>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>The script automatically loads the widget on your page</li>
                        <li>It creates a button that visitors can click to open the widget</li>
                        <li>When opened, visitors can scan the QR code to see their overlap with your community</li>
                      </ol>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="react">
                  <div className="space-y-4">
                    <p>
                      If you're using React, you can use our React component:
                    </p>
                    <div className="relative">
                      <pre className="p-4 rounded-lg bg-muted overflow-x-auto text-sm">
                        <code>{generateReactCode()}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(generateReactCode(), 'react')}
                      >
                        {copied.react ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium mb-1">How it works:</p>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Install the package using npm or yarn</li>
                        <li>Import the OverlapWidget component</li>
                        <li>Add it to your React application</li>
                        <li>You can customize the appearance using props</li>
                      </ol>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="iframe">
                  <div className="space-y-4">
                    <p>
                      If you prefer using an iframe, you can embed the widget as follows:
                    </p>
                    <div className="relative">
                      <pre className="p-4 rounded-lg bg-muted overflow-x-auto text-sm">
                        <code>{generateIframeCode()}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(generateIframeCode(), 'iframe')}
                      >
                        {copied.iframe ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium mb-1">Note:</p>
                      <p>
                        The iframe method is less customizable but works on platforms 
                        where you can't add custom JavaScript.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Installation Guide</CardTitle>
              <CardDescription>
                Follow these steps to properly set up the widget
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium">Copy the code</h3>
                    <p className="text-sm text-muted-foreground">
                      Select the integration method that works best for your website and copy the code
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">Add to your website</h3>
                    <p className="text-sm text-muted-foreground">
                      Add the code to your website where you want the widget to appear
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Test the widget</h3>
                    <p className="text-sm text-muted-foreground">
                      Visit your website and check that the widget is working correctly
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    4
                  </div>
                  <div>
                    <h3 className="font-medium">Monitor analytics</h3>
                    <p className="text-sm text-muted-foreground">
                      Return to this dashboard to view visitor engagement statistics
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Need help? Check our <a href="#" className="underline">installation documentation</a> or <a href="#" className="underline">contact support</a>
              </p>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CodeTab;