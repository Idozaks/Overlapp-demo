import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Code } from 'lucide-react';

interface TenantWithProfile {
  id: number;
  tenantId: string;
  name: string;
  email: string;
  logoUrl?: string;
  settings?: {
    allowedDomains?: string[];
    customCss?: string;
    embedOptions?: {
      position?: string;
      theme?: string;
    };
  };
  profile: {
    id: number;
    name: string;
    description?: string;
    tags: string[];
  };
}

interface CodeTabProps {
  tenant: TenantWithProfile;
}

const CodeTab: React.FC<CodeTabProps> = ({ tenant }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  
  const position = tenant.settings?.embedOptions?.position || 'bottom-right';
  const theme = tenant.settings?.embedOptions?.theme || 'light';
  
  // Generate script tag code
  const scriptTag = `<script src="${window.location.origin}/widget/init.js" 
  data-tenant-id="${tenant.tenantId}"
  data-position="${position}"
  data-theme="${theme}"></script>`;
  
  // Generate JavaScript code
  const jsCode = `<script>
  (function() {
    // Load OverlapLite Widget script
    var script = document.createElement('script');
    script.src = "${window.location.origin}/widget/init.js";
    script.async = true;
    script.onload = function() {
      // Initialize the widget
      window.OverlapWidget.init({
        tenantId: "${tenant.tenantId}",
        position: "${position}",
        theme: "${theme}"
      });
    };
    document.head.appendChild(script);
  })();
</script>`;
  
  // Generate React code
  const reactCode = `import React, { useEffect } from 'react';

const OverlapLiteWidget = () => {
  useEffect(() => {
    // Load the widget script
    const script = document.createElement('script');
    script.src = "${window.location.origin}/widget/init.js";
    script.async = true;
    script.onload = () => {
      // Initialize the widget
      window.OverlapWidget.init({
        tenantId: "${tenant.tenantId}",
        position: "${position}",
        theme: "${theme}"
      });
    };
    document.head.appendChild(script);

    // Clean up on component unmount
    return () => {
      // Find and remove the widget container
      const container = document.getElementById('overlapp-widget-container');
      if (container) {
        document.body.removeChild(container);
      }
    };
  }, []);

  return null; // This component doesn't render anything
};

export default OverlapLiteWidget;`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      
      toast({
        title: 'Copied!',
        description: 'Code copied to clipboard',
      });
      
      setTimeout(() => setCopied(null), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        title: 'Copy failed',
        description: 'Failed to copy code to clipboard',
        variant: 'destructive',
      });
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Embed the Widget</CardTitle>
          <CardDescription>
            Choose how you want to add the OverlapLite Widget to your website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="script-tag" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="script-tag">Script Tag</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="react">React Component</TabsTrigger>
            </TabsList>
            
            <TabsContent value="script-tag" className="space-y-4">
              <div className="p-4 rounded-md bg-secondary">
                <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                  <code>{scriptTag}</code>
                </pre>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Add this script tag to your HTML page, preferably before the closing <code>{'</body>'}</code> tag.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(scriptTag, 'script-tag')}
                >
                  {copied === 'script-tag' ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  Copy
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="javascript" className="space-y-4">
              <div className="p-4 rounded-md bg-secondary">
                <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                  <code>{jsCode}</code>
                </pre>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Add this JavaScript code to your website to dynamically load the widget.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(jsCode, 'javascript')}
                >
                  {copied === 'javascript' ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  Copy
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="react" className="space-y-4">
              <div className="p-4 rounded-md bg-secondary">
                <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                  <code>{reactCode}</code>
                </pre>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Create this React component and add it to your application.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(reactCode, 'react')}
                >
                  {copied === 'react' ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  Copy
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Testing the Widget</CardTitle>
          <CardDescription>
            Check that your widget is working correctly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            You can preview the widget and test its functionality using the "Preview Widget" button.
            This will show you exactly how the widget will appear on your website.
          </p>
          <p className="text-sm">
            <span className="font-semibold">Note:</span> If you've restricted the allowed domains,
            make sure to add your website's domain to the list in the Settings tab.
          </p>
          <Button className="mt-2" variant="outline" asChild>
            <a href="/tenant/preview" target="_blank" rel="noopener noreferrer">
              <Code className="h-4 w-4 mr-2" />
              Preview Widget
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CodeTab;