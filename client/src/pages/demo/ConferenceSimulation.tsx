
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface Person {
  id: number;
  position: THREE.Vector3;
  interests: string[];
  identities: Record<string, string>;
  node?: THREE.Mesh;
  label?: THREE.Sprite;
  connections: number[];
  color: string;
  name: string;
  overlapScores: Record<number, number>;
}

export default function ConferenceSimulation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const peopleRef = useRef<Person[]>([]);
  const linesRef = useRef<THREE.Line[]>([]);
  const frameIdRef = useRef<number>(0);
  
  const [overlapThreshold, setOverlapThreshold] = useState<number>(30);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [showAdvancedControls, setShowAdvancedControls] = useState<boolean>(false);
  const [simulationRunning, setSimulationRunning] = useState<boolean>(true);
  
  // Generate sample interests and identities for our simulation
  const interests = [
    'Technology', 'Art', 'Music', 'Business', 'Science', 'Literature', 'Sports',
    'Travel', 'Cooking', 'Photography', 'Gaming', 'Fashion', 'History', 'Philosophy',
    'Design', 'Film', 'Health', 'Politics', 'Education', 'Entrepreneurship'
  ];
  
  const identityAttributes = {
    professionalField: [
      'Technology', 'Healthcare', 'Education', 'Finance', 'Arts', 'Science', 
      'Engineering', 'Marketing', 'Law', 'Hospitality'
    ],
    learningStyle: [
      'Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Multimodal'
    ],
    collaborationStyle: [
      'Independent', 'Collaborative', 'Competitive', 'Supportive', 'Directive'
    ],
    countryOfOrigin: [
      'USA', 'UK', 'Canada', 'Israel', 'France', 'Germany', 'Japan', 'Australia',
      'Brazil', 'India', 'China', 'South Africa', 'Mexico', 'Italy', 'Spain'
    ]
  };
  
  // Color palette for different types of connections
  const colors = [
    '#4285F4', '#EA4335', '#FBBC05', '#34A853', // Google colors
    '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', // Various vivid colors
    '#6366F1', '#D946EF', '#F97316', '#14B8A6'  // More vibrant options
  ];
  
  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1a1a2e');
    sceneRef.current = scene;
    
    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      70, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.z = 20;
    cameraRef.current = camera;
    
    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Setup orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 10);
    scene.add(directionalLight);
    
    // Generate people for the simulation
    const people: Person[] = generatePeople(40);
    peopleRef.current = people;
    
    // Add people to the scene
    people.forEach(person => {
      if (person.node) {
        scene.add(person.node);
        scene.add(person.label!);
      }
    });
    
    // Calculate initial connections
    updateConnections(overlapThreshold);
    
    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      
      if (simulationRunning) {
        // Slightly move people randomly to simulate mingling
        people.forEach(person => {
          if (person.node) {
            // Small random movement
            person.position.x += (Math.random() - 0.5) * 0.02;
            person.position.y += (Math.random() - 0.5) * 0.02;
            person.position.z += (Math.random() - 0.5) * 0.02;
            
            // Keep within bounds
            person.position.x = Math.max(-15, Math.min(15, person.position.x));
            person.position.y = Math.max(-15, Math.min(15, person.position.y));
            person.position.z = Math.max(-15, Math.min(15, person.position.z));
            
            // Update position
            person.node.position.copy(person.position);
            person.label!.position.copy(person.position.clone().add(new THREE.Vector3(0, 0.8, 0)));
          }
        });
        
        // Update connections periodically
        if (Math.random() < 0.01) { // About every 100 frames
          updateConnections(overlapThreshold);
        }
      }
      
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Setup raycaster for selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;
      
      // Calculate mouse position in normalized device coordinates
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1;
      
      // Update the picking ray
      raycaster.setFromCamera(mouse, cameraRef.current);
      
      // Find intersections with people nodes
      const intersects = raycaster.intersectObjects(
        peopleRef.current.map(person => person.node!), 
        false
      );
      
      if (intersects.length > 0) {
        const personIndex = peopleRef.current.findIndex(
          person => person.node === intersects[0].object
        );
        
        if (personIndex !== -1) {
          setSelectedPerson(peopleRef.current[personIndex]);
          
          // Highlight the selected person and their connections
          highlightConnections(peopleRef.current[personIndex]);
        }
      } else {
        setSelectedPerson(null);
        
        // Reset all person colors
        peopleRef.current.forEach(person => {
          if (person.node) {
            (person.node.material as THREE.MeshStandardMaterial).color.set(person.color);
            (person.node.material as THREE.MeshStandardMaterial).emissive.set('#000000');
          }
        });
      }
    };
    
    containerRef.current.addEventListener('click', handleClick);
    
    // Cleanup function
    return () => {
      cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener('resize', handleResize);
      
      if (containerRef.current) {
        containerRef.current.removeEventListener('click', handleClick);
        containerRef.current.removeChild(rendererRef.current!.domElement);
      }
      
      // Clean up the scene
      linesRef.current.forEach(line => {
        sceneRef.current?.remove(line);
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      });
      
      peopleRef.current.forEach(person => {
        if (person.node) {
          sceneRef.current?.remove(person.node);
          sceneRef.current?.remove(person.label!);
          person.node.geometry.dispose();
          (person.node.material as THREE.Material).dispose();
        }
      });
    };
  }, []);
  
  // Update connections when threshold changes
  useEffect(() => {
    updateConnections(overlapThreshold);
  }, [overlapThreshold]);
  
  // Generate random people for the simulation
  const generatePeople = (count: number): Person[] => {
    const people: Person[] = [];
    
    for (let i = 0; i < count; i++) {
      // Generate random position
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30
      );
      
      // Generate random interests (2-5)
      const personInterests: string[] = [];
      const interestCount = Math.floor(Math.random() * 4) + 2;
      
      for (let j = 0; j < interestCount; j++) {
        const interest = interests[Math.floor(Math.random() * interests.length)];
        if (!personInterests.includes(interest)) {
          personInterests.push(interest);
        }
      }
      
      // Generate random identities
      const personIdentities: Record<string, string> = {};
      
      Object.entries(identityAttributes).forEach(([key, values]) => {
        personIdentities[key] = values[Math.floor(Math.random() * values.length)];
      });
      
      // Generate color based on key attributes
      const colorIndex = 
        identityAttributes.professionalField.indexOf(personIdentities.professionalField) % colors.length;
      const color = colors[colorIndex];
      
      // Create geometry and material for the person node
      const geometry = new THREE.SphereGeometry(0.5, 32, 32);
      const material = new THREE.MeshStandardMaterial({ 
        color: color,
        roughness: 0.7,
        metalness: 0.3,
      });
      
      // Create the mesh
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      
      // Create label
      const name = `Person ${i + 1}`;
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 128;
      labelCanvas.height = 32;
      
      const ctx = labelCanvas.getContext('2d')!;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, 128, 32);
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name, 64, 16);
      
      const labelTexture = new THREE.CanvasTexture(labelCanvas);
      const labelMaterial = new THREE.SpriteMaterial({ 
        map: labelTexture,
        transparent: true
      });
      
      const label = new THREE.Sprite(labelMaterial);
      label.position.copy(position.clone().add(new THREE.Vector3(0, 0.8, 0)));
      label.scale.set(2, 0.5, 1);
      
      people.push({
        id: i,
        position,
        interests: personInterests,
        identities: personIdentities,
        node: mesh,
        label,
        connections: [],
        color,
        name,
        overlapScores: {}
      });
    }
    
    return people;
  };
  
  // Calculate overlap score between two people
  const calculateOverlap = (person1: Person, person2: Person): number => {
    // Calculate interest overlap
    const sharedInterests = person1.interests.filter(
      interest => person2.interests.includes(interest)
    );
    
    const interestScore = 
      sharedInterests.length / 
      Math.max(1, (person1.interests.length + person2.interests.length) / 2);
    
    // Calculate identity overlap
    let sharedIdentities = 0;
    let totalIdentities = 0;
    
    Object.keys(person1.identities).forEach(key => {
      totalIdentities++;
      if (person2.identities[key] === person1.identities[key]) {
        sharedIdentities++;
      }
    });
    
    const identityScore = sharedIdentities / totalIdentities;
    
    // Combined score (weighted)
    const combinedScore = (interestScore * 0.6 + identityScore * 0.4) * 100;
    
    return Math.round(combinedScore);
  };
  
  // Update connections based on overlap threshold
  const updateConnections = (threshold: number) => {
    if (!sceneRef.current) return;
    
    // Remove existing lines
    linesRef.current.forEach(line => {
      sceneRef.current?.remove(line);
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    });
    
    linesRef.current = [];
    
    // Reset connections
    peopleRef.current.forEach(person => {
      person.connections = [];
    });
    
    // Calculate new connections
    for (let i = 0; i < peopleRef.current.length; i++) {
      const person1 = peopleRef.current[i];
      
      for (let j = i + 1; j < peopleRef.current.length; j++) {
        const person2 = peopleRef.current[j];
        
        // Calculate overlap between people
        const overlapScore = calculateOverlap(person1, person2);
        
        // Store overlap score for reference
        person1.overlapScores[person2.id] = overlapScore;
        person2.overlapScores[person1.id] = overlapScore;
        
        // If overlap is above threshold, create a connection
        if (overlapScore >= threshold) {
          // Create line geometry
          const points = [person1.position, person2.position];
          const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
          
          // Line material based on overlap score
          const intensity = Math.min(1, overlapScore / 100);
          const lineColor = new THREE.Color(
            0.2 + 0.8 * intensity,
            0.4 + 0.6 * intensity,
            0.7 + 0.3 * intensity
          );
          
          const lineMaterial = new THREE.LineBasicMaterial({ 
            color: lineColor,
            linewidth: 1 + Math.floor(intensity * 3),
            opacity: 0.2 + (intensity * 0.8),
            transparent: true
          });
          
          // Create line and add to scene
          const line = new THREE.Line(lineGeometry, lineMaterial);
          sceneRef.current.add(line);
          linesRef.current.push(line);
          
          // Update connections list
          person1.connections.push(person2.id);
          person2.connections.push(person1.id);
        }
      }
    }
    
    // If a person is selected, update highlighting
    if (selectedPerson) {
      const updatedPerson = peopleRef.current.find(p => p.id === selectedPerson.id);
      if (updatedPerson) {
        setSelectedPerson(updatedPerson);
        highlightConnections(updatedPerson);
      }
    }
  };
  
  // Highlight a person and their connections
  const highlightConnections = (person: Person) => {
    // Reset all person colors first
    peopleRef.current.forEach(p => {
      if (p.node) {
        (p.node.material as THREE.MeshStandardMaterial).color.set(p.color);
        (p.node.material as THREE.MeshStandardMaterial).emissive.set('#000000');
      }
    });
    
    // Highlight selected person
    if (person.node) {
      (person.node.material as THREE.MeshStandardMaterial).emissive.set('#ffffff');
      (person.node.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5;
    }
    
    // Highlight connected people
    person.connections.forEach(connectedId => {
      const connectedPerson = peopleRef.current.find(p => p.id === connectedId);
      if (connectedPerson?.node) {
        (connectedPerson.node.material as THREE.MeshStandardMaterial).emissive.set('#ffaa00');
        (connectedPerson.node.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3;
      }
    });
  };
  
  // Toggle simulation running state
  const toggleSimulation = () => {
    setSimulationRunning(!simulationRunning);
  };
  
  // Reset camera position
  const resetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    
    cameraRef.current.position.set(0, 0, 20);
    cameraRef.current.lookAt(0, 0, 0);
    controlsRef.current.update();
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Overlapp: Conference Connection Visualization</CardTitle>
          <CardDescription>
            This simulation shows how Overlapp's neural connection algorithm works in a conference environment.
            People with similar interests and identity traits form stronger connections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
            <Button onClick={toggleSimulation}>
              {simulationRunning ? 'Pause Simulation' : 'Resume Simulation'}
            </Button>
            <Button variant="outline" onClick={resetCamera}>Reset Camera</Button>
            <Button 
              variant="outline" 
              onClick={() => setShowAdvancedControls(!showAdvancedControls)}
            >
              {showAdvancedControls ? 'Hide' : 'Show'} Advanced Controls
            </Button>
          </div>
          
          {showAdvancedControls && (
            <div className="mb-6 p-4 border rounded-lg">
              <h3 className="text-lg font-medium mb-2">Connection Threshold</h3>
              <div className="flex items-center gap-4">
                <span className="text-sm">Minimal</span>
                <Slider
                  value={[overlapThreshold]}
                  min={10}
                  max={90}
                  step={5}
                  className="flex-1"
                  onValueChange={(values) => setOverlapThreshold(values[0])}
                />
                <span className="text-sm">Strong</span>
                <span className="ml-2 font-medium">{overlapThreshold}%</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Adjust to show connections only above the selected overlap threshold.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div 
            ref={containerRef} 
            className="w-full h-[500px] rounded-lg border border-muted overflow-hidden bg-black"
          />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedPerson ? selectedPerson.name : 'No Person Selected'}
              </CardTitle>
              {selectedPerson && (
                <CardDescription>
                  Click on a person in the simulation to see their details
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {selectedPerson ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedPerson.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Identity Attributes</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedPerson.identities).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-sm text-muted-foreground">{key}:</span>
                          <span className="text-sm font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Connections ({selectedPerson.connections.length})</h3>
                    {selectedPerson.connections.length > 0 ? (
                      <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                        {selectedPerson.connections.map(connId => {
                          const conn = peopleRef.current.find(p => p.id === connId);
                          return conn ? (
                            <div key={connId} className="flex justify-between items-center p-2 border rounded-md">
                              <span className="font-medium">{conn.name}</span>
                              <Badge 
                                variant={selectedPerson.overlapScores[connId] >= 70 ? "default" : "secondary"}
                                className={selectedPerson.overlapScores[connId] >= 70 ? "bg-green-600" : ""}
                              >
                                {selectedPerson.overlapScores[connId]}% match
                              </Badge>
                            </div>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No connections above the threshold.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    Click on a person in the visualization to see their details and connections.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">About This Simulation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This is a 3D visualization of how Overlapp creates meaningful connections.
                Each sphere represents a person with unique interests and identity attributes.
                Lines connect people with overlapping traits, with brighter, thicker lines indicating stronger connections.
              </p>
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2">How It Works</h3>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li>Orbit around the scene by dragging with your mouse</li>
                  <li>Zoom in/out with the scroll wheel</li>
                  <li>Click on any person to see their details</li>
                  <li>Adjust the connection threshold to see different connection strengths</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
