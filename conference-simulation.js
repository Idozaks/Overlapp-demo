
// Conference Simulation using Three.js - Based on Overlapp's connection principles
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

// Core simulation state
let scene, camera, renderer, labelRenderer;
let controls;
let participants = [];
let connections = [];

// Categories with color mapping (based on Overlapp's color scheme)
const categories = {
  'Food & Drink': 0xff9933,      // Orange
  'Arts & Culture': 0x9966ff,    // Purple
  'Lifestyle': 0xff66cc,         // Pink
  'Technology': 0x0099cc,        // Blue
  'Entertainment': 0xffcc00,     // Yellow
  'Education': 0x339966,         // Green
  'Fitness & Outdoors': 0x00cc99, // Teal
  'Travel': 0xcc6600,             // Brown
  'Other': 0x999999              // Gray
};

// Initialize the 3D scene
function init() {
  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5f5f7);
  
  // Create camera
  camera = new THREE.PerspectiveCamera(
    60, window.innerWidth / window.innerHeight, 0.1, 1000
  );
  camera.position.set(0, 30, 80);
  
  // Create renderer for 3D elements
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);
  
  // Create renderer for 2D labels
  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  document.body.appendChild(labelRenderer.domElement);
  
  // Add controls
  controls = new OrbitControls(camera, labelRenderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  
  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(20, 30, 20);
  scene.add(directionalLight);
  
  // Add conference floor
  const floorGeometry = new THREE.PlaneGeometry(100, 100);
  const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xeeeeee,
    roughness: 0.8,
    metalness: 0.2
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.5;
  scene.add(floor);
  
  // Grid helper
  const gridHelper = new THREE.GridHelper(100, 20, 0xdddddd, 0xdddddd);
  gridHelper.position.y = -0.49;
  scene.add(gridHelper);
  
  // Create legend
  createLegend();
  
  // Generate participants
  generateParticipants(30);
  
  // Handle window resize
  window.addEventListener('resize', onWindowResize);
  
  // Start animation loop
  animate();
}

// Create category legend
function createLegend() {
  const legendContainer = document.createElement('div');
  legendContainer.className = 'legend';
  legendContainer.style.position = 'absolute';
  legendContainer.style.top = '10px';
  legendContainer.style.right = '10px';
  legendContainer.style.background = 'rgba(255, 255, 255, 0.8)';
  legendContainer.style.padding = '10px';
  legendContainer.style.borderRadius = '5px';
  legendContainer.style.fontSize = '12px';
  
  const title = document.createElement('div');
  title.textContent = 'Interest Categories';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '5px';
  legendContainer.appendChild(title);
  
  Object.entries(categories).forEach(([category, color]) => {
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.alignItems = 'center';
    item.style.marginBottom = '3px';
    
    const colorBox = document.createElement('div');
    colorBox.style.width = '12px';
    colorBox.style.height = '12px';
    colorBox.style.backgroundColor = '#' + color.toString(16).padStart(6, '0');
    colorBox.style.marginRight = '5px';
    
    const label = document.createElement('span');
    label.textContent = category;
    
    item.appendChild(colorBox);
    item.appendChild(label);
    legendContainer.appendChild(item);
  });
  
  document.body.appendChild(legendContainer);
}

// Generate random participants for the simulation
function generateParticipants(count) {
  // Clear any existing participants
  participants.forEach(p => {
    scene.remove(p.mesh);
    if (p.labelObject) scene.remove(p.labelObject);
  });
  participants = [];
  
  // Create new participants
  for (let i = 0; i < count; i++) {
    // Random position on the floor
    const x = Math.random() * 80 - 40;
    const z = Math.random() * 80 - 40;
    
    // Random primary interest category
    const categoryKeys = Object.keys(categories);
    const primaryCategory = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
    
    // Random secondary interests (1-3 additional categories)
    const secondaryCount = Math.floor(Math.random() * 3) + 1;
    const secondaryCategories = [];
    const shuffled = [...categoryKeys].sort(() => 0.5 - Math.random());
    
    for (let j = 0; j < secondaryCount; j++) {
      const category = shuffled[j];
      if (category !== primaryCategory) {
        secondaryCategories.push(category);
      }
    }
    
    // Create random interests within categories
    const interests = [];
    
    const allInterests = [
      'Coffee', 'Wine Tasting', 'Pizza', 'Sushi', 'Craft Beer', // Food & Drink
      'Painting', 'Classical Music', 'Poetry', 'Sculpture', 'Jazz', // Arts & Culture
      'Fashion', 'Interior Design', 'Skincare', 'Luxury Goods', 'Minimalism', // Lifestyle
      'AI', 'Web Development', 'Blockchain', 'Mobile Apps', 'Robotics', // Technology
      'Movies', 'TV Series', 'Board Games', 'Video Games', 'Theater', // Entertainment 
      'Physics', 'Languages', 'History', 'Literature', 'Psychology', // Education
      'Running', 'Yoga', 'Hiking', 'Swimming', 'Cycling', // Fitness & Outdoors
      'Europe', 'Asia', 'Beach Vacations', 'Road Trips', 'Cultural Tourism' // Travel
    ];
    
    // Add 3-7 random interests
    const interestCount = Math.floor(Math.random() * 5) + 3;
    const shuffledInterests = [...allInterests].sort(() => 0.5 - Math.random());
    interests.push(...shuffledInterests.slice(0, interestCount));
    
    // Create participant mesh
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshStandardMaterial({ 
      color: categories[primaryCategory],
      roughness: 0.7,
      metalness: 0.3
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, 0, z);
    scene.add(mesh);
    
    // Create label
    const name = generateName();
    const labelDiv = document.createElement('div');
    labelDiv.className = 'label';
    labelDiv.textContent = name;
    labelDiv.style.marginTop = '-1em';
    labelDiv.style.fontSize = '12px';
    labelDiv.style.padding = '2px 5px';
    labelDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    labelDiv.style.borderRadius = '3px';
    
    const labelObject = new CSS2DObject(labelDiv);
    labelObject.position.set(0, 2, 0);
    mesh.add(labelObject);
    
    // Movement properties
    const movementSpeed = Math.random() * 0.02 + 0.01;
    const movementAngle = Math.random() * Math.PI * 2;
    const movementTimer = Math.random() * 200 + 100;
    
    // Add to participants array
    participants.push({
      id: i,
      name,
      mesh,
      labelObject,
      interests,
      primaryCategory,
      secondaryCategories,
      position: { x, z },
      movement: {
        speed: movementSpeed,
        angle: movementAngle,
        timer: movementTimer,
        counter: 0
      }
    });
  }
  
  // Create initial connections
  updateConnections();
}

// Generate a random name
function generateName() {
  const firstNames = [
    'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery',
    'Quinn', 'Skyler', 'Dakota', 'Peyton', 'Reese', 'Emery', 'Finley'
  ];
  
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis',
    'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Lee'
  ];
  
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

// Calculate connection strength between two participants
function calculateConnectionStrength(p1, p2) {
  let strength = 0;
  
  // Check for shared interests
  const sharedInterests = p1.interests.filter(i => p2.interests.includes(i));
  strength += sharedInterests.length * 0.2;
  
  // Bonus for shared primary category
  if (p1.primaryCategory === p2.primaryCategory) {
    strength += 0.3;
  }
  
  // Bonus for shared secondary categories
  const sharedSecondary = p1.secondaryCategories.filter(c => 
    p2.secondaryCategories.includes(c) || p2.primaryCategory === c
  );
  strength += sharedSecondary.length * 0.15;
  
  // Cap at 1.0 for strongest connection
  return Math.min(strength, 1.0);
}

// Update connections between participants
function updateConnections() {
  // Remove old connections
  connections.forEach(conn => {
    scene.remove(conn.line);
  });
  connections = [];
  
  // Create new connections based on proximity and shared interests
  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      const p1 = participants[i];
      const p2 = participants[j];
      
      // Calculate physical distance
      const distance = Math.sqrt(
        Math.pow(p1.mesh.position.x - p2.mesh.position.x, 2) +
        Math.pow(p1.mesh.position.z - p2.mesh.position.z, 2)
      );
      
      // Only connect if within reasonable distance (proximity-based)
      if (distance > 25) continue;
      
      // Calculate connection strength based on shared interests and categories
      const strength = calculateConnectionStrength(p1, p2);
      
      // Only create visible connections if there's meaningful overlap
      if (strength > 0.3) {
        // Determine which shared category to use for the connection
        let connectionCategory = 'Other';
        
        if (p1.primaryCategory === p2.primaryCategory) {
          connectionCategory = p1.primaryCategory;
        } else {
          // Check for shared secondary categories
          const sharedCategories = [
            ...p1.secondaryCategories.filter(c => 
              p2.secondaryCategories.includes(c) || p2.primaryCategory === c
            ),
            ...p2.secondaryCategories.filter(c => p1.primaryCategory === c)
          ];
          
          if (sharedCategories.length > 0) {
            connectionCategory = sharedCategories[0];
          }
        }
        
        // Create visual connection
        const points = [
          new THREE.Vector3(p1.mesh.position.x, 0.5, p1.mesh.position.z),
          new THREE.Vector3(p2.mesh.position.x, 0.5, p2.mesh.position.z)
        ];
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        // Color based on the shared category
        const color = categories[connectionCategory];
        const material = new THREE.LineBasicMaterial({ 
          color: color,
          transparent: true,
          opacity: Math.max(0.2, strength * 0.8), // Connection strength affects opacity
          linewidth: 1
        });
        
        const line = new THREE.Line(geometry, material);
        scene.add(line);
        
        // Track connection
        connections.push({
          participants: [p1.id, p2.id],
          strength,
          category: connectionCategory,
          line,
          sharedInterests: p1.interests.filter(i => p2.interests.includes(i))
        });
      }
    }
  }
}

// Handle window resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Update movement of participants
  participants.forEach(p => {
    // Update movement counter
    p.movement.counter++;
    
    // Change direction occasionally
    if (p.movement.counter >= p.movement.timer) {
      p.movement.angle = Math.random() * Math.PI * 2;
      p.movement.timer = Math.random() * 200 + 100;
      p.movement.counter = 0;
    }
    
    // Calculate new position
    const newX = p.mesh.position.x + Math.cos(p.movement.angle) * p.movement.speed;
    const newZ = p.mesh.position.z + Math.sin(p.movement.angle) * p.movement.speed;
    
    // Boundary check
    if (newX > -45 && newX < 45 && newZ > -45 && newZ < 45) {
      p.mesh.position.x = newX;
      p.mesh.position.z = newZ;
    } else {
      // Reverse direction if hitting boundary
      p.movement.angle = (p.movement.angle + Math.PI) % (Math.PI * 2);
    }
  });
  
  // Update connections periodically (not every frame for performance)
  if (Math.random() < 0.05) {
    updateConnections();
  }
  
  // Update connections (only the existing ones)
  connections.forEach(conn => {
    const p1 = participants.find(p => p.id === conn.participants[0]);
    const p2 = participants.find(p => p.id === conn.participants[1]);
    
    // Update line positions
    const positions = conn.line.geometry.attributes.position.array;
    positions[0] = p1.mesh.position.x;
    positions[1] = 0.5;
    positions[2] = p1.mesh.position.z;
    positions[3] = p2.mesh.position.x;
    positions[4] = 0.5;
    positions[5] = p2.mesh.position.z;
    
    conn.line.geometry.attributes.position.needsUpdate = true;
  });
  
  // Update controls
  controls.update();
  
  // Render scene
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

// UI to show participant details when clicked
function setupInteraction() {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  
  // Create info panel
  const infoPanel = document.createElement('div');
  infoPanel.className = 'info-panel';
  infoPanel.style.position = 'absolute';
  infoPanel.style.left = '10px';
  infoPanel.style.top = '10px';
  infoPanel.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
  infoPanel.style.padding = '15px';
  infoPanel.style.borderRadius = '5px';
  infoPanel.style.maxWidth = '300px';
  infoPanel.style.display = 'none';
  document.body.appendChild(infoPanel);
  
  // Handle click events
  window.addEventListener('click', (event) => {
    // Calculate mouse position
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Raycast to find clicked objects
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    
    if (intersects.length > 0) {
      // Find if we clicked on a participant
      const clickedParticipant = participants.find(p => p.mesh === intersects[0].object);
      
      if (clickedParticipant) {
        // Show info panel
        showParticipantInfo(clickedParticipant, infoPanel);
      } else {
        // Hide panel if clicking elsewhere
        infoPanel.style.display = 'none';
      }
    } else {
      // Hide panel if clicking on nothing
      infoPanel.style.display = 'none';
    }
  });
}

// Show participant information in the info panel
function showParticipantInfo(participant, panel) {
  // Find connections for this participant
  const participantConnections = connections.filter(conn => 
    conn.participants.includes(participant.id)
  );
  
  // Sort connections by strength
  participantConnections.sort((a, b) => b.strength - a.strength);
  
  // Format HTML content
  let html = `
    <h3>${participant.name}</h3>
    <div style="margin-bottom: 10px;">
      <strong>Primary Interest:</strong> 
      <span style="color: #${categories[participant.primaryCategory].toString(16).padStart(6, '0')}">
        ${participant.primaryCategory}
      </span>
    </div>
    
    <div style="margin-bottom: 10px;">
      <strong>Interests:</strong>
      <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-top: 5px;">
        ${participant.interests.map(interest => 
          `<span style="background: #f0f0f0; padding: 2px 6px; border-radius: 10px; font-size: 11px;">
            ${interest}
          </span>`
        ).join('')}
      </div>
    </div>
  `;
  
  // Show connections section if there are any
  if (participantConnections.length > 0) {
    html += `
      <div>
        <strong>Top Connections:</strong>
        <ul style="margin-top: 5px; padding-left: 20px;">
          ${participantConnections.slice(0, 3).map(conn => {
            const otherParticipantId = conn.participants.find(id => id !== participant.id);
            const otherParticipant = participants.find(p => p.id === otherParticipantId);
            return `
              <li style="margin-bottom: 5px;">
                <strong>${otherParticipant.name}</strong> 
                (${Math.round(conn.strength * 100)}% match)
                <div style="font-size: 11px; color: #666;">
                  Via ${conn.category} | 
                  ${conn.sharedInterests.length} shared interests
                </div>
              </li>
            `;
          }).join('')}
        </ul>
      </div>
    `;
  } else {
    html += `<div><em>No strong connections yet</em></div>`;
  }
  
  // Update and show panel
  panel.innerHTML = html;
  panel.style.display = 'block';
}

// Initialize everything
function initSimulation() {
  init();
  setupInteraction();
  
  // Add UI controls
  const controls = document.createElement('div');
  controls.className = 'simulation-controls';
  controls.style.position = 'absolute';
  controls.style.bottom = '10px';
  controls.style.left = '10px';
  controls.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
  controls.style.padding = '10px';
  controls.style.borderRadius = '5px';
  
  const regenerateBtn = document.createElement('button');
  regenerateBtn.textContent = 'Regenerate People';
  regenerateBtn.style.marginRight = '10px';
  regenerateBtn.style.padding = '5px 10px';
  regenerateBtn.addEventListener('click', () => generateParticipants(30));
  
  const connectionSlider = document.createElement('input');
  connectionSlider.type = 'range';
  connectionSlider.min = '0.1';
  connectionSlider.max = '0.8';
  connectionSlider.step = '0.1';
  connectionSlider.value = '0.3';
  connectionSlider.style.width = '100px';
  connectionSlider.style.marginLeft = '10px';
  
  const sliderLabel = document.createElement('span');
  sliderLabel.textContent = 'Connection Threshold: 0.3';
  
  connectionSlider.addEventListener('input', (e) => {
    const value = e.target.value;
    sliderLabel.textContent = `Connection Threshold: ${value}`;
    // Would update connection threshold here
  });
  
  controls.appendChild(regenerateBtn);
  controls.appendChild(sliderLabel);
  controls.appendChild(connectionSlider);
  document.body.appendChild(controls);
}

// Start the simulation
document.addEventListener('DOMContentLoaded', initSimulation);

// Add basic styles for the simulation
const style = document.createElement('style');
style.textContent = `
  body { margin: 0; overflow: hidden; font-family: 'Arial', sans-serif; }
  .label { pointer-events: none; }
  .info-panel { box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
`;
document.head.appendChild(style);
