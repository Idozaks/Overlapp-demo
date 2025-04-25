import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScaleIn, SlideIn, FadeIn, StaggerContainer } from '@/components/layout/AnimationUtilities';

// Old imports - keeping for reference in case they're needed
import EnhancedOverlappAnimation, { NodeData } from '../components/landing/EnhancedOverlappAnimation';
import NodeInfoPanel from '../components/landing/NodeInfoPanel';

// Animation page that demonstrates the new animation components
const Animation: React.FC = () => {
  const { t } = useTranslation();
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [activeTab, setActiveTab] = useState('transitions');

  const handleNodeSelect = (nodeData: NodeData) => {
    setSelectedNode(nodeData);
  };

  const handlePanelClose = () => {
    setSelectedNode(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6 text-center"
      >
        <h1 className="text-3xl font-bold mb-2">{t('Animation Demo')}</h1>
        <p className="text-muted-foreground">
          Explore the various animation effects and transitions available in the application
        </p>
      </motion.div>

      <Tabs defaultValue="transitions" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="transitions">Page Transitions</TabsTrigger>
          <TabsTrigger value="components">Component Animations</TabsTrigger>
          <TabsTrigger value="visualization">Visualization Demo</TabsTrigger>
        </TabsList>

        <TabsContent value="transitions" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Page Transition Effects</CardTitle>
              <CardDescription>
                Smooth animations when navigating between pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="overflow-hidden">
                  <CardHeader className="bg-primary/5 pb-2">
                    <CardTitle className="text-sm">Fade Transition</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <FadeIn>
                      <div className="h-32 bg-muted rounded-md flex items-center justify-center">
                        Content fades in and out
                      </div>
                    </FadeIn>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => {
                      const el = document.getElementById('fade-demo');
                      if (el) el.className = 'opacity-0';
                      setTimeout(() => {
                        if (el) el.className = 'opacity-100 transition-opacity duration-500';
                      }, 500);
                    }}>Replay Animation</Button>
                  </CardFooter>
                </Card>

                <Card className="overflow-hidden">
                  <CardHeader className="bg-primary/5 pb-2">
                    <CardTitle className="text-sm">Slide Transition</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <SlideIn>
                      <div className="h-32 bg-muted rounded-md flex items-center justify-center">
                        Content slides in from the side
                      </div>
                    </SlideIn>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => {
                      const el = document.getElementById('slide-demo');
                      if (el) {
                        el.className = 'opacity-0 transform translate-x-8';
                        setTimeout(() => {
                          if (el) el.className = 'opacity-100 transform translate-x-0 transition-all duration-500';
                        }, 500);
                      }
                    }}>Replay Animation</Button>
                  </CardFooter>
                </Card>

                <Card className="overflow-hidden">
                  <CardHeader className="bg-primary/5 pb-2">
                    <CardTitle className="text-sm">Scale Transition</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ScaleIn>
                      <div className="h-32 bg-muted rounded-md flex items-center justify-center">
                        Content scales in and out
                      </div>
                    </ScaleIn>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => {
                      const el = document.getElementById('scale-demo');
                      if (el) {
                        el.className = 'opacity-0 transform scale-95';
                        setTimeout(() => {
                          if (el) el.className = 'opacity-100 transform scale-100 transition-all duration-500';
                        }, 500);
                      }
                    }}>Replay Animation</Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Component Animation Examples</CardTitle>
              <CardDescription>
                Elements with staggered animations for improved user experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((item) => (
                  <SlideIn key={item} delay={item * 0.1} className="w-full">
                    <Card>
                      <CardContent className="p-4">
                        <div className="h-24 flex items-center justify-center">
                          Item {item} - Delayed by {item * 0.1}s
                        </div>
                      </CardContent>
                    </Card>
                  </SlideIn>
                ))}
              </StaggerContainer>
              
              <div className="mt-8">
                <Button onClick={() => setActiveTab('components')} className="w-full">
                  Replay Staggered Animation
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scroll Animations</CardTitle>
              <CardDescription>
                Elements that animate as you scroll down the page
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96 overflow-auto p-6 space-y-24 bg-muted/10 rounded-md">
              {[1, 2, 3, 4, 5].map((item) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: "-100px" }}
                  transition={{ duration: 0.8 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="h-48 flex items-center justify-center">
                        <p className="text-xl">Scroll Item {item}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualization">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Node Visualization</CardTitle>
              <CardDescription>
                Original animation with smooth transitions and interactive elements
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full h-[calc(100vh-400px)] bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col md:flex-row overflow-hidden">
                <div className={`flex-grow ${selectedNode ? 'md:w-2/3' : 'w-full'}`}>
                  <EnhancedOverlappAnimation 
                    className="h-full min-h-[300px]" 
                    onNodeSelect={handleNodeSelect}
                  />
                </div>
                
                {/* Only show panel when a node is selected */}
                {selectedNode && (
                  <div className="md:w-1/3 max-w-md h-full overflow-auto bg-white dark:bg-gray-800 shadow-lg">
                    <NodeInfoPanel 
                      nodeData={selectedNode} 
                      onClose={handlePanelClose} 
                    />
                  </div>
                )}
                
                {/* Instruction banner */}
                <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg text-sm pointer-events-none">
                  Click on any node to see detailed information
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Animation;