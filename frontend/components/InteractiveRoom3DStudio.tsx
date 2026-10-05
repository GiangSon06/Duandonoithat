"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import * as THREE from "three";
import {
  RotateCcw,
  Sparkles,
  Sun,
  Sunset,
  Moon,
  Eye,
  Maximize2,
  Compass,
  ShoppingBag,
  Calendar,
  Check,
  X,
  Layers,
  Info,
  ChevronRight,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/products";

export type StagedItem3D = {
  id: string | number;
  name: string;
  role: string;
  material: string;
  dimensions: string;
  price: number;
  image: string;
  reason?: string;
  badge?: string;
  modelType?: "sofa" | "table" | "chair" | "bed" | "dining" | "lamp";
};

type InteractiveRoom3DStudioProps = {
  roomType?: string;
  styleName?: string;
  roomArea?: string | number;
  originalImage?: string | null;
  items?: StagedItem3D[];
  onAddToCart?: (item: StagedItem3D) => void;
  onAddComboToCart?: () => void;
  onBookConsultation?: () => void;
};

// Procedural Canvas Texture Generators
function createHerringboneWoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Base wood color
  ctx.fillStyle = "#3B281B";
  ctx.fillRect(0, 0, 1024, 1024);

  // Planks
  const plankW = 128;
  const plankH = 32;
  const colors = ["#432E1F", "#3A2619", "#4A3423", "#332115", "#473020"];

  for (let y = 0; y < 1024; y += plankH) {
    for (let x = 0; x < 1024; x += plankW) {
      const col = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillStyle = col;
      ctx.fillRect(x + 1, y + 1, plankW - 2, plankH - 2);

      // Subtle grain lines
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 1;
      for (let g = 4; g < plankH - 4; g += 6) {
        ctx.beginPath();
        ctx.moveTo(x + 2, y + g);
        ctx.lineTo(x + plankW - 2, y + g + (Math.random() * 2 - 1));
        ctx.stroke();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

function createMarbleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Calacatta Marble off-white base
  ctx.fillStyle = "#F5F4F0";
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle marble vein paths
  ctx.strokeStyle = "rgba(180, 175, 165, 0.4)";
  ctx.lineWidth = 3;
  ctx.filter = "blur(4px)";

  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    let x = Math.random() * 1024;
    let y = 0;
    ctx.moveTo(x, y);
    while (y < 1024) {
      x += (Math.random() - 0.5) * 80;
      y += 50 + Math.random() * 50;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Gold accent veins
  ctx.strokeStyle = "rgba(212, 175, 55, 0.25)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    let x = Math.random() * 1024;
    let y = 0;
    ctx.moveTo(x, y);
    while (y < 1024) {
      x += (Math.random() - 0.5) * 60;
      y += 60 + Math.random() * 60;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

function createRugTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Base woven cream / oatmeal
  ctx.fillStyle = "#DDD8CD";
  ctx.fillRect(0, 0, 512, 512);

  // Subtle woven grid
  ctx.fillStyle = "rgba(150, 140, 130, 0.12)";
  for (let x = 0; x < 512; x += 8) {
    ctx.fillRect(x, 0, 4, 512);
  }
  for (let y = 0; y < 512; y += 8) {
    ctx.fillRect(0, y, 512, 4);
  }

  // Border outline
  ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
  ctx.lineWidth = 12;
  ctx.strokeRect(16, 16, 480, 480);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

export default function InteractiveRoom3DStudio({
  roomType = "Phòng Khách Penthouse",
  styleName = "Modern Italian Luxury",
  roomArea = "35",
  originalImage,
  items = [],
  onAddToCart,
  onAddComboToCart,
  onBookConsultation,
}: InteractiveRoom3DStudioProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Lighting References
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const ceilingLightGroupRef = useRef<THREE.Group | null>(null);

  // Materials References
  const floorMeshRef = useRef<THREE.Mesh | null>(null);
  const sofaMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const furnitureMeshesMapRef = useRef<Map<string, THREE.Group>>(new Map());

  // Interactive UI States
  const [activePresetView, setActivePresetView] = useState<"orbit" | "eye" | "focal" | "top">("orbit");
  const [timeOfDay, setTimeOfDay] = useState<"day" | "sunset" | "night">("day");
  const [sofaColorHex, setSofaColorHex] = useState<string>("#964B00"); // Default Cognac leather
  const [floorType, setFloorType] = useState<"wood" | "marble" | "concrete">("wood");
  const [selectedItem, setSelectedItem] = useState<StagedItem3D | null>(null);
  const [isHoveringFurniture, setIsHoveringFurniture] = useState(false);
  const [isRotatingNotice, setIsRotatingNotice] = useState(true);

  // Mouse & Touch Orbit Controls Math
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({
    radius: 7.2,
    theta: Math.PI * 0.25, // horizontal angle
    phi: Math.PI * 0.32,  // vertical angle
  });
  const targetLookAtRef = useRef(new THREE.Vector3(0, 0.4, 0));
  const currentLookAtRef = useRef(new THREE.Vector3(0, 0.4, 0));
  const currentCameraPosRef = useRef(new THREE.Vector3(5, 4, 5));
  const targetCameraPosRef = useRef(new THREE.Vector3(5, 4, 5));

  // Resolved default items if not provided
  const activeItems: StagedItem3D[] = useMemo(() => {
    if (items && items.length > 0) return items;
    return [
      {
        id: "sofa_modular_riviera",
        name: "Sofa Modular Riviera 3 Chỗ Bọc Da Ý",
        role: "Tâm Điểm Phòng Khách",
        material: "Da bò thuộc thảo mộc Tuscany, khung gỗ sồi FAS",
        dimensions: "280 × 105 × 82 cm",
        price: 38500000,
        image: "/images/sofa-1.jpg",
        reason: "Cân đối với diện tích phòng, tạo điểm tựa thị giác sang trọng.",
        badge: "Bán chạy nhất",
        modelType: "sofa",
      },
      {
        id: "table_aria_marble",
        name: "Bàn Trà Đôi Đá Marble Calacatta Viền Gold",
        role: "Bàn Trà Tâm Điểm",
        material: "Đá cẩm thạch Calacatta Ý tự nhiên, khung mạ PVD vàng",
        dimensions: "120 × 70 × 42 cm",
        price: 18500000,
        image: "/images/dining-table-1.jpg",
        reason: "Bề mặt sáng phản chiếu ánh sáng tự nhiên từ cửa ban công.",
        badge: "Đá Calacatta",
        modelType: "table",
      },
      {
        id: "chair_aurora_lounge",
        name: "Ghế Lounge Thư Giãn Aurora Velvet",
        role: "Ghế Bành Thư Giãn",
        material: "Vải nhung Bỉ cao cấp, chân inox mạ titan bóng",
        dimensions: "85 × 80 × 75 cm",
        price: 14500000,
        image: "/images/products/lounge-chair.jpg",
        reason: "Mở rộng góc thư giãn ngắm cảnh đón nắng hướng cửa sổ.",
        badge: "Mẫu mới 2026",
        modelType: "chair",
      },
    ];
  }, [items]);

  // Hide rotation notice after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setIsRotatingNotice(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  // Update Camera Target based on Preset
  const setCameraPreset = useCallback((preset: "orbit" | "eye" | "focal" | "top") => {
    setActivePresetView(preset);
    if (preset === "orbit") {
      sphericalRef.current = { radius: 7.5, theta: Math.PI * 0.28, phi: Math.PI * 0.32 };
      targetLookAtRef.current.set(0, 0.4, 0);
    } else if (preset === "eye") {
      sphericalRef.current = { radius: 5.2, theta: Math.PI * 0.15, phi: Math.PI * 0.44 };
      targetLookAtRef.current.set(0, 0.8, 0);
    } else if (preset === "focal") {
      sphericalRef.current = { radius: 4.2, theta: 0.05, phi: Math.PI * 0.38 };
      targetLookAtRef.current.set(0, 0.45, 0.2);
    } else if (preset === "top") {
      sphericalRef.current = { radius: 8.8, theta: 0.0, phi: 0.05 };
      targetLookAtRef.current.set(0, 0, 0);
    }
  }, []);

  // ---------------- INITIALIZE THREE.JS SCENE ----------------
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 560;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x121214);
    scene.fog = new THREE.FogExp2(0x121214, 0.018);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(5.5, 4.2, 5.5);
    camera.lookAt(0, 0.4, 0);
    cameraRef.current = camera;
    currentCameraPosRef.current.copy(camera.position);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    // 4. Lighting System
    const ambientLight = new THREE.AmbientLight(0xfff8e7, 1.4);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    // Sun Directional Light (streams from window on the left: X = -4.5)
    const dirLight = new THREE.DirectionalLight(0xfffaed, 2.8);
    dirLight.position.set(-6, 5.5, 3);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 25;
    dirLight.shadow.camera.left = -6;
    dirLight.shadow.camera.right = 6;
    dirLight.shadow.camera.top = 6;
    dirLight.shadow.camera.bottom = -6;
    dirLight.shadow.bias = -0.0008;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Ceiling Spotlight Group (Interior Architectural Downlights)
    const ceilingLightGroup = new THREE.Group();
    const spot1 = new THREE.SpotLight(0xffeedd, 2.0, 10, Math.PI / 4, 0.4, 1.2);
    spot1.position.set(0, 3.1, 0);
    spot1.target.position.set(0, 0, 0);
    scene.add(spot1.target);
    ceilingLightGroup.add(spot1);

    const warmAccent = new THREE.PointLight(0xd4af37, 1.2, 7);
    warmAccent.position.set(2.8, 1.8, -2.5);
    ceilingLightGroup.add(warmAccent);

    scene.add(ceilingLightGroup);
    ceilingLightGroupRef.current = ceilingLightGroup;

    // 5. ARCHITECTURAL 3D ROOM SHELL
    // Room Dimensions: Width 8.5m, Length 7.5m, Height 3.2m
    const roomGroup = new THREE.Group();

    // Floor
    const woodTex = createHerringboneWoodTexture();
    const floorGeo = new THREE.PlaneGeometry(8.6, 7.6);
    const floorMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.38,
      metalness: 0.08,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    roomGroup.add(floorMesh);
    floorMeshRef.current = floorMesh;

    // Area Rug on Floor (Center Seating Zone)
    const rugTex = createRugTexture();
    const rugGeo = new THREE.PlaneGeometry(4.4, 3.2);
    const rugMat = new THREE.MeshStandardMaterial({
      map: rugTex,
      roughness: 0.85,
      metalness: 0.02,
    });
    const rugMesh = new THREE.Mesh(rugGeo, rugMat);
    rugMesh.rotation.x = -Math.PI / 2;
    rugMesh.position.set(0, 0.005, 0.1);
    rugMesh.receiveShadow = true;
    roomGroup.add(rugMesh);

    // Back Wall (Z = -3.75)
    const wallMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x282624),
      roughness: 0.85,
      metalness: 0.05,
    });
    const backWallGeo = new THREE.BoxGeometry(8.6, 3.2, 0.15);
    const backWallMesh = new THREE.Mesh(backWallGeo, wallMat);
    backWallMesh.position.set(0, 1.6, -3.75);
    backWallMesh.receiveShadow = true;
    roomGroup.add(backWallMesh);

    // Decorative Skirting Board / Baseboard (Brass Gold Trim)
    const skirtingGeo = new THREE.BoxGeometry(8.6, 0.1, 0.04);
    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xd4af37),
      roughness: 0.25,
      metalness: 0.85,
    });
    const skirting = new THREE.Mesh(skirtingGeo, goldTrimMat);
    skirting.position.set(0, 0.05, -3.66);
    roomGroup.add(skirting);

    // Right Wall (X = 4.25)
    const rightWallGeo = new THREE.BoxGeometry(0.15, 3.2, 7.6);
    const rightWallMesh = new THREE.Mesh(rightWallGeo, wallMat);
    rightWallMesh.position.set(4.25, 1.6, 0);
    rightWallMesh.receiveShadow = true;
    roomGroup.add(rightWallMesh);

    // Left Wall with Grand Architectural Window & Balcony (X = -4.25)
    // Wall panels around the window
    const leftWallTopGeo = new THREE.BoxGeometry(0.15, 0.5, 7.6);
    const leftWallTop = new THREE.Mesh(leftWallTopGeo, wallMat);
    leftWallTop.position.set(-4.25, 2.95, 0);
    roomGroup.add(leftWallTop);

    // Window Glass Panes & Metal Mullions
    const windowFrameGeo = new THREE.BoxGeometry(0.08, 2.7, 5.2);
    const frameMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x18181a),
      roughness: 0.4,
      metalness: 0.8,
    });
    const windowFrame = new THREE.Mesh(windowFrameGeo, frameMat);
    windowFrame.position.set(-4.25, 1.35, 0);
    roomGroup.add(windowFrame);

    // Glass (Subtle reflective transparent)
    const glassGeo = new THREE.PlaneGeometry(5.0, 2.6);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xaaccff),
      transparent: true,
      opacity: 0.2,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.85,
      ior: 1.5,
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.rotation.y = Math.PI / 2;
    glassMesh.position.set(-4.24, 1.35, 0);
    roomGroup.add(glassMesh);

    // Scenic Outdoor Sky Backdrop beyond window
    const skyBackdropGeo = new THREE.PlaneGeometry(16, 8);
    const skyMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x3a4b5d),
    });
    const skyMesh = new THREE.Mesh(skyBackdropGeo, skyMat);
    skyMesh.rotation.y = Math.PI / 2;
    skyMesh.position.set(-7.5, 2.5, 0);
    roomGroup.add(skyMesh);

    // Abstract Luxury Canvas Art on Back Wall
    const artCanvasGeo = new THREE.BoxGeometry(2.4, 1.4, 0.04);
    const artMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x1a1a1c),
      roughness: 0.5,
    });
    const artMesh = new THREE.Mesh(artCanvasGeo, artMat);
    artMesh.position.set(0, 1.85, -3.66);
    artMesh.castShadow = true;
    roomGroup.add(artMesh);

    // Gold frame around art
    const artFrameGeo = new THREE.BoxGeometry(2.46, 1.46, 0.02);
    const artFrame = new THREE.Mesh(artFrameGeo, goldTrimMat);
    artFrame.position.set(0, 1.85, -3.67);
    roomGroup.add(artFrame);

    // Fiddle-Leaf Fig Indoor Plant in Corner (X = 3.3, Z = -2.8)
    const plantGroup = new THREE.Group();
    plantGroup.position.set(3.2, 0, -2.8);
    // Pot
    const potGeo = new THREE.CylinderGeometry(0.3, 0.22, 0.65, 32);
    const potMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xdedede),
      roughness: 0.3,
    });
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.y = 0.325;
    pot.castShadow = true;
    plantGroup.add(pot);
    // Stem & Leaves
    const stemGeo = new THREE.CylinderGeometry(0.03, 0.04, 1.5, 12);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x3d2817 });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = 1.0;
    plantGroup.add(stem);

    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x1b4332,
      roughness: 0.6,
    });
    for (let l = 0; l < 8; l++) {
      const leafGeo = new THREE.SphereGeometry(0.24, 8, 8);
      leafGeo.scale(1.2, 0.15, 0.8);
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(
        Math.cos(l * 1.1) * 0.35,
        0.8 + l * 0.16,
        Math.sin(l * 1.1) * 0.35
      );
      leaf.rotation.z = (Math.random() - 0.5) * 0.5;
      leaf.castShadow = true;
      plantGroup.add(leaf);
    }
    roomGroup.add(plantGroup);

    scene.add(roomGroup);

    // ---------------- 6. BUILD PROCEDURAL 3D FURNITURE ----------------
    const furnitureMeshesMap = new Map<string, THREE.Group>();
    sofaMaterialsRef.current = [];

    // --- ITEM 1: MAIN LUXURY SOFA (Center Position [0, 0, -0.6]) ---
    const sofaGroup = new THREE.Group();
    sofaGroup.position.set(0, 0, -0.7);
    sofaGroup.userData = {
      itemIndex: 0,
      id: activeItems[0]?.id || "sofa_modular_riviera",
      name: activeItems[0]?.name || "Sofa Modular Riviera",
    };

    const sofaLeatherMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(sofaColorHex),
      roughness: 0.38,
      metalness: 0.12,
    });
    sofaMaterialsRef.current.push(sofaLeatherMat);

    // Sofa Base Plinth (Dark Walnut)
    const sofaPlinthGeo = new THREE.BoxGeometry(2.7, 0.08, 1.05);
    const woodMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x2d1e15),
      roughness: 0.5,
    });
    const sofaPlinth = new THREE.Mesh(sofaPlinthGeo, woodMat);
    sofaPlinth.position.y = 0.08;
    sofaPlinth.castShadow = true;
    sofaGroup.add(sofaPlinth);

    // Brass Cone Legs
    const legGeo = new THREE.CylinderGeometry(0.025, 0.015, 0.12, 16);
    const legPositions = [
      [-1.25, 0.06, 0.45],
      [1.25, 0.06, 0.45],
      [-1.25, 0.06, -0.45],
      [1.25, 0.06, -0.45],
      [0, 0.06, -0.45],
    ];
    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, goldTrimMat);
      leg.position.set(x, y, z);
      leg.castShadow = true;
      sofaGroup.add(leg);
    });

    // 3 Plush Seat Cushions
    for (let c = 0; c < 3; c++) {
      const cushionGeo = new THREE.BoxGeometry(0.85, 0.24, 0.88, 16, 4, 16);
      const cushion = new THREE.Mesh(cushionGeo, sofaLeatherMat);
      cushion.position.set(-0.9 + c * 0.9, 0.24, 0.05);
      cushion.castShadow = true;
      cushion.receiveShadow = true;
      sofaGroup.add(cushion);
    }

    // Curved Backrest
    const backrestGeo = new THREE.BoxGeometry(2.7, 0.55, 0.28, 24, 8, 8);
    const backrest = new THREE.Mesh(backrestGeo, sofaLeatherMat);
    backrest.position.set(0, 0.54, -0.38);
    backrest.castShadow = true;
    sofaGroup.add(backrest);

    // Left & Right Armrests
    const armrestLeftGeo = new THREE.BoxGeometry(0.24, 0.42, 1.02);
    const armrestLeft = new THREE.Mesh(armrestLeftGeo, sofaLeatherMat);
    armrestLeft.position.set(-1.35, 0.4, 0.0);
    armrestLeft.castShadow = true;
    sofaGroup.add(armrestLeft);

    const armrestRight = new THREE.Mesh(armrestLeftGeo, sofaLeatherMat);
    armrestRight.position.set(1.35, 0.4, 0.0);
    armrestRight.castShadow = true;
    sofaGroup.add(armrestRight);

    // 2 Decorative Velvet Throw Pillows
    const pillowMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xd4af37),
      roughness: 0.8,
    });
    const pillowGeo = new THREE.BoxGeometry(0.38, 0.38, 0.14);
    const pillow1 = new THREE.Mesh(pillowGeo, pillowMat);
    pillow1.position.set(-1.08, 0.48, -0.15);
    pillow1.rotation.y = 0.35;
    pillow1.rotation.z = -0.15;
    pillow1.castShadow = true;
    sofaGroup.add(pillow1);

    const pillow2 = new THREE.Mesh(pillowGeo, pillowMat);
    pillow2.position.set(1.08, 0.48, -0.15);
    pillow2.rotation.y = -0.35;
    pillow2.rotation.z = 0.15;
    pillow2.castShadow = true;
    sofaGroup.add(pillow2);

    scene.add(sofaGroup);
    furnitureMeshesMap.set("sofa", sofaGroup);

    // --- ITEM 2: DUAL NESTING MARBLE COFFEE TABLE (Position [0, 0, 0.7]) ---
    const tableGroup = new THREE.Group();
    tableGroup.position.set(0, 0, 0.65);
    tableGroup.userData = {
      itemIndex: 1,
      id: activeItems[1]?.id || "table_aria_marble",
      name: activeItems[1]?.name || "Bàn Trà Đôi Đá Calacatta",
    };

    // Primary High Round Table (White Calacatta)
    const marbleMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xf6f5f2),
      roughness: 0.18,
      metalness: 0.08,
    });
    const mainTableTopGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.05, 48);
    const mainTableTop = new THREE.Mesh(mainTableTopGeo, marbleMat);
    mainTableTop.position.set(-0.25, 0.42, 0);
    mainTableTop.castShadow = true;
    mainTableTop.receiveShadow = true;
    tableGroup.add(mainTableTop);

    // Brass Rim around high table
    const mainRimGeo = new THREE.CylinderGeometry(0.56, 0.56, 0.03, 48);
    const mainRim = new THREE.Mesh(mainRimGeo, goldTrimMat);
    mainRim.position.set(-0.25, 0.39, 0);
    tableGroup.add(mainRim);

    // Fluted Cylindrical Base
    const baseDrumGeo = new THREE.CylinderGeometry(0.38, 0.44, 0.38, 36);
    const baseDrum = new THREE.Mesh(baseDrumGeo, woodMat);
    baseDrum.position.set(-0.25, 0.19, 0);
    baseDrum.castShadow = true;
    tableGroup.add(baseDrum);

    // Secondary Low Nesting Table (Smoked Glass / Nero Marquina)
    const lowTableTopGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.04, 48);
    const darkMarbleMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x222224),
      roughness: 0.15,
      metalness: 0.1,
    });
    const lowTableTop = new THREE.Mesh(lowTableTopGeo, darkMarbleMat);
    lowTableTop.position.set(0.42, 0.32, 0.18);
    lowTableTop.castShadow = true;
    tableGroup.add(lowTableTop);

    const lowBaseGeo = new THREE.CylinderGeometry(0.28, 0.34, 0.28, 32);
    const lowBase = new THREE.Mesh(lowBaseGeo, goldTrimMat);
    lowBase.position.set(0.42, 0.14, 0.18);
    lowBase.castShadow = true;
    tableGroup.add(lowBase);

    // Champagne flute decor on table
    const glassTrayGeo = new THREE.CylinderGeometry(0.16, 0.14, 0.015, 24);
    const glassTray = new THREE.Mesh(glassTrayGeo, goldTrimMat);
    glassTray.position.set(-0.25, 0.45, 0);
    tableGroup.add(glassTray);

    scene.add(tableGroup);
    furnitureMeshesMap.set("table", tableGroup);

    // --- ITEM 3: DESIGNER LOUNGE ACCENT CHAIR (Position [1.9, 0, 0.3], angled 40°) ---
    const chairGroup = new THREE.Group();
    chairGroup.position.set(1.9, 0, 0.3);
    chairGroup.rotation.y = -Math.PI * 0.45; // Angled facing the sofa & coffee table
    chairGroup.userData = {
      itemIndex: 2,
      id: activeItems[2]?.id || "chair_aurora_lounge",
      name: activeItems[2]?.name || "Ghế Lounge Aurora",
    };

    const chairVelvetMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x283830), // Emerald luxury velvet
      roughness: 0.75,
      metalness: 0.05,
    });

    // Swivel Base (PVD Gold Star Base)
    const chairStemGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.22, 16);
    const chairStem = new THREE.Mesh(chairStemGeo, goldTrimMat);
    chairStem.position.y = 0.11;
    chairGroup.add(chairStem);

    const chairBasePlateGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.03, 32);
    const chairBasePlate = new THREE.Mesh(chairBasePlateGeo, goldTrimMat);
    chairBasePlate.position.y = 0.02;
    chairBasePlate.castShadow = true;
    chairGroup.add(chairBasePlate);

    // Seat Bucket Cushion
    const seatGeo = new THREE.CylinderGeometry(0.46, 0.42, 0.16, 32);
    const chairSeat = new THREE.Mesh(seatGeo, chairVelvetMat);
    chairSeat.position.y = 0.28;
    chairSeat.castShadow = true;
    chairGroup.add(chairSeat);

    // Curved Shell Backrest
    const shellGeo = new THREE.CylinderGeometry(0.48, 0.46, 0.54, 32, 4, true, 0, Math.PI);
    const chairShell = new THREE.Mesh(shellGeo, chairVelvetMat);
    chairShell.position.set(0, 0.52, -0.05);
    chairShell.rotation.y = Math.PI * 0.5;
    chairShell.castShadow = true;
    chairGroup.add(chairShell);

    scene.add(chairGroup);
    furnitureMeshesMap.set("chair", chairGroup);

    // --- ITEM 4: ARC BRASS FLOOR LAMP (Position [-2.4, 0, -1.8]) ---
    const lampGroup = new THREE.Group();
    lampGroup.position.set(-2.4, 0, -1.8);
    // Base
    const lampBaseGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.06, 24);
    const lampBase = new THREE.Mesh(lampBaseGeo, marbleMat);
    lampBase.position.y = 0.03;
    lampBase.castShadow = true;
    lampGroup.add(lampBase);

    // Arc Pole
    const arcGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.4, 16);
    const arcMesh = new THREE.Mesh(arcGeo, goldTrimMat);
    arcMesh.position.set(0.1, 1.2, 0);
    arcMesh.rotation.z = -0.15;
    lampGroup.add(arcMesh);

    // Shade
    const shadeGeo = new THREE.ConeGeometry(0.25, 0.3, 24, 1, true);
    const shadeMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.2,
      metalness: 0.9,
    });
    const shade = new THREE.Mesh(shadeGeo, shadeMat);
    shade.position.set(0.5, 2.15, 0.3);
    shade.rotation.x = Math.PI;
    lampGroup.add(shade);

    // Warm Light Bulb
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfff0c0 });
    const bulbGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(0.5, 2.05, 0.3);
    lampGroup.add(bulb);

    const lampLight = new THREE.PointLight(0xffdd88, 1.8, 4.5);
    lampLight.position.set(0.5, 2.0, 0.3);
    lampGroup.add(lampLight);

    scene.add(lampGroup);

    furnitureMeshesMapRef.current = furnitureMeshesMap;

    // ---------------- ANIMATION & SMOOTH LERP LOOP ----------------
    let isRunning = true;

    const animate = () => {
      if (!isRunning) return;
      animationFrameRef.current = requestAnimationFrame(animate);

      // Convert spherical coordinates to Cartesian for target camera pos
      const { radius, theta, phi } = sphericalRef.current;
      targetCameraPosRef.current.x = targetLookAtRef.current.x + radius * Math.sin(phi) * Math.sin(theta);
      targetCameraPosRef.current.y = targetLookAtRef.current.y + radius * Math.cos(phi);
      targetCameraPosRef.current.z = targetLookAtRef.current.z + radius * Math.sin(phi) * Math.cos(theta);

      // Smooth camera interpolation (Damping / Easing)
      currentCameraPosRef.current.lerp(targetCameraPosRef.current, 0.08);
      currentLookAtRef.current.lerp(targetLookAtRef.current, 0.08);

      camera.position.copy(currentCameraPosRef.current);
      camera.lookAt(currentLookAtRef.current);

      renderer.render(scene, camera);
    };

    animate();

    // ---------------- WINDOW RESIZE HANDLER ----------------
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 560;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup on unmount
    return () => {
      isRunning = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [activeItems]);

  // ---------------- UPDATE TIME OF DAY LIGHTING ----------------
  useEffect(() => {
    if (!dirLightRef.current || !ambientLightRef.current || !ceilingLightGroupRef.current || !sceneRef.current) return;

    if (timeOfDay === "day") {
      sceneRef.current.background = new THREE.Color(0x14181f);
      ambientLightRef.current.color.setHex(0xfff8ed);
      ambientLightRef.current.intensity = 1.4;

      dirLightRef.current.color.setHex(0xfffaea);
      dirLightRef.current.intensity = 3.0;
      dirLightRef.current.position.set(-6, 5.5, 3);

      ceilingLightGroupRef.current.visible = true;
    } else if (timeOfDay === "sunset") {
      sceneRef.current.background = new THREE.Color(0x1a1210);
      ambientLightRef.current.color.setHex(0xf3d2b5);
      ambientLightRef.current.intensity = 1.1;

      dirLightRef.current.color.setHex(0xff8c42);
      dirLightRef.current.intensity = 3.8;
      dirLightRef.current.position.set(-7, 3.2, 3); // Low angle sunset

      ceilingLightGroupRef.current.visible = true;
    } else if (timeOfDay === "night") {
      sceneRef.current.background = new THREE.Color(0x0a0c10);
      ambientLightRef.current.color.setHex(0x3a4b60);
      ambientLightRef.current.intensity = 0.5;

      dirLightRef.current.color.setHex(0x556688);
      dirLightRef.current.intensity = 0.6; // Moonlight

      ceilingLightGroupRef.current.visible = true;
    }
  }, [timeOfDay]);

  // ---------------- UPDATE SOFA LEATHER COLOR ----------------
  useEffect(() => {
    sofaMaterialsRef.current.forEach((mat) => {
      mat.color.set(sofaColorHex);
    });
  }, [sofaColorHex]);

  // ---------------- UPDATE FLOOR TEXTURE ----------------
  useEffect(() => {
    if (!floorMeshRef.current) return;
    if (floorType === "wood") {
      const woodTex = createHerringboneWoodTexture();
      floorMeshRef.current.material = new THREE.MeshStandardMaterial({
        map: woodTex,
        roughness: 0.38,
        metalness: 0.08,
      });
    } else if (floorType === "marble") {
      const marbleTex = createMarbleTexture();
      floorMeshRef.current.material = new THREE.MeshStandardMaterial({
        map: marbleTex,
        roughness: 0.14,
        metalness: 0.12,
      });
    } else {
      floorMeshRef.current.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x363430),
        roughness: 0.65,
        metalness: 0.05,
      });
    }
  }, [floorType]);

  // ---------------- POINTER / MOUSE / TOUCH EVENTS ----------------
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    setIsRotatingNotice(false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // 1. Raycast detection for cursor hover
    if (canvasRef.current && cameraRef.current && sceneRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const furnitureGroups: THREE.Object3D[] = [];
      furnitureMeshesMapRef.current.forEach((group) => furnitureGroups.push(group));

      const intersects = raycaster.intersectObjects(furnitureGroups, true);
      setIsHoveringFurniture(intersects.length > 0);
    }

    // 2. Drag Orbit Rotation
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    sphericalRef.current.theta -= deltaX * 0.007;
    sphericalRef.current.phi = Math.max(
      0.08,
      Math.min(Math.PI * 0.48, sphericalRef.current.phi - deltaY * 0.007)
    );

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;

    // Check for Click on Furniture (Raycaster)
    if (!canvasRef.current || !cameraRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const clickableList: THREE.Object3D[] = [];
    furnitureMeshesMapRef.current.forEach((grp) => clickableList.push(grp));

    const intersects = raycaster.intersectObjects(clickableList, true);
    if (intersects.length > 0) {
      let topGroup: THREE.Object3D | null = intersects[0].object;
      while (topGroup && topGroup.parent && !topGroup.userData?.itemIndex && topGroup.userData?.itemIndex !== 0) {
        topGroup = topGroup.parent;
      }
      if (topGroup && (topGroup.userData?.itemIndex !== undefined)) {
        const itemIdx = topGroup.userData.itemIndex;
        const targetItem = activeItems[itemIdx] || activeItems[0];
        setSelectedItem(targetItem);

        // Smooth focus camera on clicked item
        targetLookAtRef.current.set(topGroup.position.x, topGroup.position.y + 0.4, topGroup.position.z);
        sphericalRef.current.radius = 4.2;
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    sphericalRef.current.radius = Math.max(
      2.8,
      Math.min(10.5, sphericalRef.current.radius + e.deltaY * 0.005)
    );
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-gold/40 shadow-2xl bg-[#0D0D0F] select-none group">
      {/* TOP HEADER HUD OVERLAY */}
      <div className="absolute top-0 inset-x-0 z-20 p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-none flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
              LIVE 3D SPATIAL STUDIO • WEBGL 60FPS
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-gold/15 text-gold text-[10px] font-mono border border-gold/30">
              Tỷ Lệ 1:1 Khổ Phòng {roomArea}m²
            </span>
          </div>
          <h3 className="font-serif text-lg sm:text-2xl text-champagne font-normal drop-shadow">
            Không Gian 3D Tương Tác: {roomType}
          </h3>
          <p className="text-xs text-beige/70 font-light hidden sm:block">
            Mô hình phòng được dựng theo ảnh của bạn. Bạn có thể xoay 360°, đổi màu da bò và bấm vào từng món đồ để xem chi tiết.
          </p>
        </div>

        {/* View Preset Buttons */}
        <div className="pointer-events-auto flex items-center bg-black/70 backdrop-blur-md border border-white/15 rounded-2xl p-1 shadow-xl">
          <button
            onClick={() => setCameraPreset("orbit")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activePresetView === "orbit"
                ? "bg-gold text-charcoal font-semibold shadow"
                : "text-beige/70 hover:text-white"
            }`}
            title="Góc nhìn 360 độ quanh phòng"
          >
            <Compass size={13} />
            <span className="hidden md:inline">Toàn Cảnh 360°</span>
          </button>

          <button
            onClick={() => setCameraPreset("eye")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activePresetView === "eye"
                ? "bg-gold text-charcoal font-semibold shadow"
                : "text-beige/70 hover:text-white"
            }`}
            title="Góc nhìn thực tế ở tầm mắt 1.6m"
          >
            <Eye size={13} />
            <span className="hidden md:inline">Mắt Người (1.6m)</span>
          </button>

          <button
            onClick={() => setCameraPreset("focal")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activePresetView === "focal"
                ? "bg-gold text-charcoal font-semibold shadow"
                : "text-beige/70 hover:text-white"
            }`}
            title="Cận cảnh sofa & bàn trà"
          >
            <Sparkles size={13} />
            <span className="hidden md:inline">Cận Cảnh Sofa</span>
          </button>

          <button
            onClick={() => setCameraPreset("top")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activePresetView === "top"
                ? "bg-gold text-charcoal font-semibold shadow"
                : "text-beige/70 hover:text-white"
            }`}
            title="Góc nhìn mặt bằng từ trên trần xuống"
          >
            <Layers size={13} />
            <span className="hidden md:inline">Mặt Bằng 2D/3D</span>
          </button>
        </div>
      </div>

      {/* THREE.JS WEBGL CANVAS */}
      <div
        ref={containerRef}
        className={`relative w-full h-[480px] sm:h-[580px] lg:h-[650px] bg-gradient-to-b from-[#141416] via-[#101012] to-[#0a0a0c] ${
          isHoveringFurniture ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
        }`}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
          className="w-full h-full block"
        />

        {/* 3D In-Scene Hotspot Badges floating directly over furniture positions */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Tag 1: Sofa */}
          <div className="absolute top-[48%] left-[45%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
            <button
              onClick={() => {
                setSelectedItem(activeItems[0]);
                targetLookAtRef.current.set(0, 0.4, -0.7);
                sphericalRef.current.radius = 4.2;
              }}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-gold/70 text-gold text-xs shadow-lg hover:scale-105 hover:bg-gold hover:text-charcoal transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-gold group-hover:bg-charcoal animate-ping" />
              <span className="font-semibold text-[11px]">Sofa Modular Riviera</span>
            </button>
          </div>

          {/* Tag 2: Coffee Table */}
          <div className="absolute top-[64%] left-[54%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
            <button
              onClick={() => {
                setSelectedItem(activeItems[1]);
                targetLookAtRef.current.set(0, 0.35, 0.65);
                sphericalRef.current.radius = 3.8;
              }}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/30 text-beige text-xs shadow-lg hover:scale-105 hover:border-gold hover:text-gold transition-all"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/70 group-hover:bg-gold" />
              <span className="font-medium text-[11px]">Bàn Trà Calacatta</span>
            </button>
          </div>

          {/* Tag 3: Lounge Chair */}
          <div className="absolute top-[52%] left-[72%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
            <button
              onClick={() => {
                setSelectedItem(activeItems[2]);
                targetLookAtRef.current.set(1.9, 0.4, 0.3);
                sphericalRef.current.radius = 3.8;
              }}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/30 text-beige text-xs shadow-lg hover:scale-105 hover:border-gold hover:text-gold transition-all"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/70 group-hover:bg-gold" />
              <span className="font-medium text-[11px]">Ghế Lounge Aurora</span>
            </button>
          </div>
        </div>

        {/* Center Initial Tutorial Pulse (Auto hides) */}
        {isRotatingNotice && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 transition-opacity duration-1000">
            <div className="px-5 py-3 rounded-2xl bg-black/85 backdrop-blur-md border border-gold/50 shadow-2xl text-center space-y-1 text-xs text-beige animate-bounce">
              <p className="font-serif font-bold text-gold text-sm flex items-center justify-center gap-2">
                <Compass size={16} />
                <span>Kéo Chuột Hoặc Vuốt Để Xoay 360°</span>
              </p>
              <p className="text-[11px] text-beige/70">
                Bấm vào từng món đồ để xem bóc tách chi tiết &amp; vật liệu
              </p>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM CONTROL DOCK OVERLAY */}
      <div className="p-4 sm:p-5 bg-gradient-to-t from-black via-black/95 to-black/80 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
        {/* GROUP 1: LIGHTING TIME-OF-DAY TOGGLES */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-beige/50 mr-1 hidden sm:inline">
            Ánh Sáng:
          </span>
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setTimeOfDay("day")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                timeOfDay === "day"
                  ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                  : "text-beige/60 hover:text-white"
              }`}
            >
              <Sun size={13} />
              <span>Ban Ngày</span>
            </button>
            <button
              onClick={() => setTimeOfDay("sunset")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                timeOfDay === "sunset"
                  ? "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                  : "text-beige/60 hover:text-white"
              }`}
            >
              <Sunset size={13} />
              <span>Hoàng Hôn</span>
            </button>
            <button
              onClick={() => setTimeOfDay("night")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                timeOfDay === "night"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                  : "text-beige/60 hover:text-white"
              }`}
            >
              <Moon size={13} />
              <span>Đêm Sang</span>
            </button>
          </div>
        </div>

        {/* GROUP 2: SOFA LEATHER COLOR CHIPS */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-beige/50 mr-1 hidden sm:inline">
            Da Bọc Sofa 3D:
          </span>
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1.5">
            {[
              { hex: "#964B00", name: "Da Bò Cognac" },
              { hex: "#EAE3D2", name: "Kem Nappa Bắc Âu" },
              { hex: "#282828", name: "Nhung Charcoal" },
              { hex: "#1B4332", name: "Xanh Emerald" },
            ].map((col) => (
              <button
                key={col.hex}
                onClick={() => setSofaColorHex(col.hex)}
                className={`w-6 h-6 rounded-lg transition-transform ${
                  sofaColorHex === col.hex ? "scale-125 ring-2 ring-gold" : "hover:scale-110 opacity-70"
                }`}
                style={{ backgroundColor: col.hex }}
                title={col.name}
              />
            ))}
          </div>
        </div>

        {/* GROUP 3: FLOOR MATERIAL SELECTOR */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-beige/50 mr-1 hidden sm:inline">
            Sàn Nhà:
          </span>
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
            <button
              onClick={() => setFloorType("wood")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                floorType === "wood" ? "bg-gold text-charcoal font-semibold" : "text-beige/60 hover:text-white"
              }`}
            >
              Gỗ Óc Chó
            </button>
            <button
              onClick={() => setFloorType("marble")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                floorType === "marble" ? "bg-gold text-charcoal font-semibold" : "text-beige/60 hover:text-white"
              }`}
            >
              Đá Calacatta
            </button>
          </div>
        </div>

        {/* GROUP 4: CALL TO ACTION BUTTONS */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={onBookConsultation}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white/5 border border-white/20 hover:border-gold text-beige hover:text-gold text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
          >
            <Calendar size={13} />
            <span>KTS Khảo Sát</span>
          </button>

          <button
            onClick={onAddComboToCart}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold via-[#F0D8A8] to-gold text-charcoal text-xs font-bold uppercase tracking-wider shadow-lg shadow-gold/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag size={14} />
            <span>Mua Trọn Bộ 3D (-10%)</span>
          </button>
        </div>
      </div>

      {/* SELECTED 3D FURNITURE INSPECTION MODAL DRAWER */}
      {selectedItem && (
        <div className="absolute bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-30 bg-charcoal/95 backdrop-blur-xl border border-gold/50 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-gold block">
                {selectedItem.role}
              </span>
              <h4 className="font-serif text-base font-bold text-champagne mt-0.5">
                {selectedItem.name}
              </h4>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="p-1 rounded-lg text-beige/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex gap-3">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-black/60 shrink-0 border border-white/10">
              <Image src={selectedItem.image} alt={selectedItem.name} fill className="object-cover" />
            </div>
            <div className="space-y-1 text-xs text-beige/70">
              <p>
                <strong className="text-beige font-medium">Chất liệu:</strong> {selectedItem.material}
              </p>
              <p className="font-mono text-[11px]">
                <strong className="text-beige font-medium">Kích thước:</strong> {selectedItem.dimensions}
              </p>
              <p className="text-gold font-bold text-sm font-serif">
                {formatPrice(selectedItem.price)}
              </p>
            </div>
          </div>

          {selectedItem.reason && (
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-beige/80 italic leading-relaxed">
              &ldquo;{selectedItem.reason}&rdquo;
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                if (onAddToCart) onAddToCart(selectedItem);
                setSelectedItem(null);
              }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gold text-charcoal font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-1.5 shadow"
            >
              <ShoppingBag size={14} />
              <span>Thêm Món Này Vào Giỏ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
