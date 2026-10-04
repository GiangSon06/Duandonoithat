"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Camera,
  Play,
  Pause,
  Sparkles,
  Smartphone,
  Check,
  Eye,
  Layers,
  X,
} from "lucide-react";
import { formatPrice } from "@/lib/products";

export type ColorVariant = {
  id: string;
  name: string;
  colorHex: string;
  material: "leather" | "velvet" | "wood" | "marble";
  priceDiff?: number;
  previewColor: string;
};

export type FurnitureModelType =
  | "coffee_table"
  | "dining_table"
  | "chair_short"
  | "sofa_long"
  | "bed"
  | "cabinet";

export function detectFurnitureModelType(
  productName: string = "",
  category: string = "",
  productId: string = ""
): FurnitureModelType {
  const norm = `${productName} ${category} ${productId}`.toLowerCase();

  // 1. Bàn trà, bàn sofa, bàn đá nhỏ (Coffee Table)
  if (
    norm.includes("bàn trà") ||
    norm.includes("bàn sofa") ||
    norm.includes("coffee-table") ||
    norm.includes("coffee table") ||
    norm.includes("tea table") ||
    norm.includes("table-marble") ||
    norm.includes("marble aria")
  ) {
    return "coffee_table";
  }

  // 2. Bàn ăn, dining table (Dining Table)
  if (
    norm.includes("bàn ăn") ||
    norm.includes("dining-table") ||
    norm.includes("dining table") ||
    norm.includes("bộ bàn ăn") ||
    (norm.includes("dining") && !norm.includes("ghế") && !norm.includes("chair"))
  ) {
    return "dining_table";
  }

  // 3. Ghế đơn, ghế lounge, ghế đọc sách, ghế bành, armchair (Single Seater / Short Chair)
  if (
    norm.includes("ghế") ||
    norm.includes("chair") ||
    norm.includes("armchair") ||
    norm.includes("lounge") ||
    norm.includes("sofa đơn") ||
    norm.includes("ghế đơn") ||
    norm.includes("đơn") ||
    norm.includes("ombré") ||
    norm.includes("noir")
  ) {
    return "chair_short";
  }

  // 4. Giường ngủ (Bed / Canopy)
  if (
    norm.includes("giường") ||
    norm.includes("bed") ||
    norm.includes("canopy") ||
    norm.includes("elysée") ||
    norm.includes("mattress")
  ) {
    return "bed";
  }

  // 5. Tủ, kệ, bàn làm việc, tủ bếp, đảo bếp (Cabinet / Wardrobe / Desk)
  if (
    norm.includes("tủ") ||
    norm.includes("kệ") ||
    norm.includes("wardrobe") ||
    norm.includes("desk") ||
    norm.includes("bàn làm việc") ||
    norm.includes("bếp") ||
    norm.includes("kitchen") ||
    norm.includes("đảo bếp")
  ) {
    return "cabinet";
  }

  // 6. Mặc định là Sofa dài (Long Sofa)
  return "sofa_long";
}

export const MODEL_DEFAULT_VARIANTS: Record<FurnitureModelType, ColorVariant[]> = {
  coffee_table: [
    {
      id: "carrara_white",
      name: "Đá Trắng Carrara / Viền Vàng 24K",
      colorHex: "#F7F7F8",
      material: "marble",
      priceDiff: 0,
      previewColor: "#F4F4F4",
    },
    {
      id: "nero_marquina",
      name: "Đá Đen Tia Chớp Nero Marquina",
      colorHex: "#1C1C1E",
      material: "marble",
      priceDiff: 4000000,
      previewColor: "#1C1C1E",
    },
    {
      id: "calacatta_gold",
      name: "Đá Calacatta Gold Ý Cẩm Thạch",
      colorHex: "#F0EDE5",
      material: "marble",
      priceDiff: 6000000,
      previewColor: "#EDE6D6",
    },
    {
      id: "verde_emerald",
      name: "Đá Xanh Ngọc Verde Guatemala",
      colorHex: "#193328",
      material: "marble",
      priceDiff: 8000000,
      previewColor: "#1A3B2E",
    },
  ],
  dining_table: [
    {
      id: "calacatta_dining",
      name: "Mặt Đá Calacatta / Chân Vàng PVD",
      colorHex: "#F0EDE5",
      material: "marble",
      priceDiff: 0,
      previewColor: "#EAE5DA",
    },
    {
      id: "walnut_dining",
      name: "Gỗ Óc Chó FAS Bắc Mỹ / Dát Vàng",
      colorHex: "#4A2E1B",
      material: "wood",
      priceDiff: -5000000,
      previewColor: "#4A2E1B",
    },
    {
      id: "nero_dining",
      name: "Đá Đen Marquina / Chân Hợp Kim",
      colorHex: "#1E1E20",
      material: "marble",
      priceDiff: 7000000,
      previewColor: "#1E1E20",
    },
    {
      id: "smoked_oak",
      name: "Gỗ Sồi Hun Khói / Chân Đồng Cổ",
      colorHex: "#2C221E",
      material: "wood",
      priceDiff: -3000000,
      previewColor: "#2C221E",
    },
  ],
  chair_short: [
    {
      id: "cognac_chair",
      name: "Da Bò Ý Nhập Khẩu Cognac",
      colorHex: "#964B00",
      material: "leather",
      priceDiff: 0,
      previewColor: "#9A5020",
    },
    {
      id: "charcoal_chair",
      name: "Nỉ Nhung Đen Bỉ (Charcoal)",
      colorHex: "#222222",
      material: "velvet",
      priceDiff: -1500000,
      previewColor: "#222222",
    },
    {
      id: "cream_chair",
      name: "Da Nappa Kem Bắc Âu (Ivory)",
      colorHex: "#F2ECE1",
      material: "leather",
      priceDiff: 2000000,
      previewColor: "#EADDC7",
    },
    {
      id: "emerald_chair",
      name: "Nhung Xanh Rêu Emerald",
      colorHex: "#1B4332",
      material: "velvet",
      priceDiff: 1000000,
      previewColor: "#1B4332",
    },
  ],
  sofa_long: [
    {
      id: "cognac",
      name: "Da Bò Ý Tuscan Cognac",
      colorHex: "#964B00",
      material: "leather",
      priceDiff: 0,
      previewColor: "#9A5020",
    },
    {
      id: "charcoal",
      name: "Nỉ Nhung Bỉ Charcoal Black",
      colorHex: "#222222",
      material: "velvet",
      priceDiff: -2500000,
      previewColor: "#222222",
    },
    {
      id: "nappa_cream",
      name: "Da Nappa Kem Bắc Âu (Ivory)",
      colorHex: "#F2ECE1",
      material: "leather",
      priceDiff: 3000000,
      previewColor: "#EADDC7",
    },
    {
      id: "emerald",
      name: "Nhung Xanh Ngọc Lục Bảo",
      colorHex: "#1B4332",
      material: "velvet",
      priceDiff: 1500000,
      previewColor: "#1B4332",
    },
  ],
  bed: [
    {
      id: "oatmeal_linen",
      name: "Vải Lanh Dệt Tay Tự Nhiên (Oatmeal)",
      colorHex: "#E3DAC9",
      material: "velvet",
      priceDiff: 0,
      previewColor: "#DCD0BA",
    },
    {
      id: "ivory_nappa",
      name: "Da Nappa Kem Bắc Âu (Ivory)",
      colorHex: "#F4F0E8",
      material: "leather",
      priceDiff: 4000000,
      previewColor: "#EBE3D3",
    },
    {
      id: "charcoal_bed",
      name: "Nỉ Nhung Xám Khói Than (Charcoal)",
      colorHex: "#2C2C2E",
      material: "velvet",
      priceDiff: 1500000,
      previewColor: "#2C2C2E",
    },
    {
      id: "midnight_blue",
      name: "Nhung Xanh Đêm (Midnight Navy)",
      colorHex: "#152238",
      material: "velvet",
      priceDiff: 3000000,
      previewColor: "#152238",
    },
  ],
  cabinet: [
    {
      id: "walnut_marble",
      name: "Gỗ Óc Chó & Mặt Đá Cẩm Thạch",
      colorHex: "#4A2E1B",
      material: "wood",
      priceDiff: 0,
      previewColor: "#4A2E1B",
    },
    {
      id: "ebony_gold",
      name: "Gỗ Mun Đen Piano & Phào Chỉ Vàng",
      colorHex: "#1C1C1C",
      material: "wood",
      priceDiff: 4500000,
      previewColor: "#1C1C1C",
    },
    {
      id: "natural_oak",
      name: "Gỗ Sồi Trắng Tự Nhiên Bắc Âu",
      colorHex: "#C4A482",
      material: "wood",
      priceDiff: -2500000,
      previewColor: "#C4A482",
    },
    {
      id: "calacatta_gold",
      name: "Mặt Đá Calacatta & Thân Trắng Sữa",
      colorHex: "#EDE8DF",
      material: "marble",
      priceDiff: 6000000,
      previewColor: "#EDE8DF",
    },
  ],
};

const MODEL_CONFIGS: Record<
  FurnitureModelType,
  {
    heroPos: [number, number, number];
    frontPos: [number, number, number];
    topPos: [number, number, number];
    dimensions: string;
    variantLabel: string;
  }
> = {
  coffee_table: {
    heroPos: [1.7, 1.35, 1.7],
    frontPos: [0, 0.25, 2.3],
    topPos: [0, 2.5, 0.15],
    dimensions: "Đường kính 100cm × Chiều cao 42cm",
    variantLabel: "Vật Liệu Mặt Đá & Bảng Màu Tự Nhiên",
  },
  dining_table: {
    heroPos: [2.8, 1.7, 2.4],
    frontPos: [0, 0.4, 3.4],
    topPos: [0, 3.8, 0.2],
    dimensions: "240cm (Dài) × 110cm (Rộng) × 76cm (Cao)",
    variantLabel: "Vật Liệu Mặt Bàn & Chân Đế Dát Vàng",
  },
  chair_short: {
    heroPos: [1.8, 1.3, 1.8],
    frontPos: [0, 0.25, 2.3],
    topPos: [0, 2.8, 0.2],
    dimensions: "92cm (Rộng) × 88cm (Sâu) × 82cm (Cao)",
    variantLabel: "Chất Liệu Bọc Da & Nỉ Cao Cấp",
  },
  sofa_long: {
    heroPos: [2.6, 1.8, 2.6],
    frontPos: [0, 0.4, 3.6],
    topPos: [0, 4.0, 0.3],
    dimensions: "260cm (Dài) × 95cm (Sâu) × 85cm (Cao)",
    variantLabel: "Chất Liệu & Bảng Màu Da Đang Chọn",
  },
  bed: {
    heroPos: [2.7, 1.9, 2.7],
    frontPos: [0, 0.6, 3.6],
    topPos: [0, 4.2, 0.3],
    dimensions: "200cm (Rộng) × 220cm (Dài) × 135cm (Cao)",
    variantLabel: "Chất Liệu Bọc Nệm & Đầu Giường",
  },
  cabinet: {
    heroPos: [2.4, 1.5, 2.4],
    frontPos: [0, 0.3, 3.0],
    topPos: [0, 3.6, 0.2],
    dimensions: "180cm (Dài) × 55cm (Sâu) × 85cm (Cao)",
    variantLabel: "Chất Liệu Gỗ & Mặt Đá Hoàn Thiện",
  },
};

type ProductViewer3DProps = {
  productName: string;
  basePrice: number;
  category?: string;
  productId?: string;
  variants?: ColorVariant[];
  onVariantChange?: (variant: ColorVariant, newPrice: number) => void;
  className?: string;
};

export default function ProductViewer3D({
  productName,
  basePrice,
  category = "sofa",
  productId = "",
  variants,
  onVariantChange,
  className = "",
}: ProductViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Automatically determine the exact 3D model architecture
  const modelType = detectFurnitureModelType(productName, category, productId);
  const activeVariants =
    variants && variants.length > 0 ? variants : MODEL_DEFAULT_VARIANTS[modelType];
  const modelConfig = MODEL_CONFIGS[modelType];

  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ColorVariant>(activeVariants[0]);
  const [autoRotate, setAutoRotate] = useState(true);
  const [activeCameraAngle, setActiveCameraAngle] = useState<"hero" | "front" | "top">("hero");
  const [arOpen, setArOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // References for Three.js scene instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const mainMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  // Compute live current price
  const currentPrice = basePrice + (selectedVariant.priceDiff || 0);

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 480;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup according to furniture model
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    const [initX, initY, initZ] = modelConfig.heroPos;
    camera.position.set(initX, initY, initZ);
    cameraRef.current = camera;

    // 3. Renderer with PBR settings
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    rendererRef.current = renderer;

    // 4. Studio Lighting System
    const hemiLight = new THREE.HemisphereLight(0xfff8e7, 0x333333, 0.95);
    scene.add(hemiLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    mainKeyLight.position.set(4, 6, 4);
    mainKeyLight.castShadow = true;
    mainKeyLight.shadow.mapSize.width = 1024;
    mainKeyLight.shadow.mapSize.height = 1024;
    mainKeyLight.shadow.camera.near = 0.5;
    mainKeyLight.shadow.camera.far = 15;
    mainKeyLight.shadow.bias = -0.0005;
    scene.add(mainKeyLight);

    const fillLight = new THREE.DirectionalLight(0xd4af37, 0.7);
    fillLight.position.set(-4, 3, -2);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffffff, 1.4, 10);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    // 5. Soft Ground Shadow Plane
    const shadowPlaneGeo = new THREE.PlaneGeometry(8, 8);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.22 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.52;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // 6. Build High-Fidelity 3D Furniture Mesh
    const modelGroup = new THREE.Group();
    modelGroupRef.current = modelGroup;
    mainMaterialsRef.current = [];

    // Shared luxury materials
    const primaryMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(selectedVariant.colorHex),
      roughness:
        selectedVariant.material === "marble"
          ? 0.15
          : selectedVariant.material === "velvet"
          ? 0.75
          : selectedVariant.material === "wood"
          ? 0.55
          : 0.42,
      metalness:
        selectedVariant.material === "marble"
          ? 0.08
          : selectedVariant.material === "leather"
          ? 0.1
          : 0.05,
    });
    mainMaterialsRef.current.push(primaryMaterial);

    // Gold Metal PVD Brass Accent Material
    const goldPvdMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xd4af37),
      metalness: 0.92,
      roughness: 0.18,
    });

    // Dark Walnut Wood Base Material
    const woodBaseMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x3e2723),
      roughness: 0.55,
      metalness: 0.05,
    });

    // Clean White Marble / Fabric Accent
    const whiteFabricMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xf5f3ee),
      roughness: 0.65,
      metalness: 0.05,
    });

    // ---------------- MODEL ARCHITECTURES ----------------
    if (modelType === "coffee_table") {
      // === BÀN TRÀ MARBLE ARIA (Đá tròn nguyên khối, viền vàng 24K, đế trụ vát) ===
      // 1. Mặt bàn tròn đá cẩm thạch nguyên khối
      const tableTopGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.08, 64);
      const tableTopMesh = new THREE.Mesh(tableTopGeo, primaryMaterial);
      tableTopMesh.position.set(0, 0.08, 0);
      tableTopMesh.castShadow = true;
      tableTopMesh.receiveShadow = true;
      modelGroup.add(tableTopMesh);

      // 2. Vành đai kim loại mạ vàng 24K quanh cổ bàn
      const goldRimGeo = new THREE.CylinderGeometry(0.865, 0.865, 0.04, 64);
      const goldRimMesh = new THREE.Mesh(goldRimGeo, goldPvdMaterial);
      goldRimMesh.position.set(0, 0.02, 0);
      goldRimMesh.castShadow = true;
      modelGroup.add(goldRimMesh);

      // 3. Khối thân trụ đá hoa văn sang trọng (Drum body)
      const drumGeo = new THREE.CylinderGeometry(0.82, 0.72, 0.38, 48);
      const drumMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xeeece8),
        roughness: 0.35,
        metalness: 0.05,
      });
      const drumMesh = new THREE.Mesh(drumGeo, drumMat);
      drumMesh.position.set(0, -0.19, 0);
      drumMesh.castShadow = true;
      drumMesh.receiveShadow = true;
      modelGroup.add(drumMesh);

      // 4. Chân đế mạ vàng 24K (Recessed Brass Ring Base)
      const baseRingGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.06, 48);
      const baseRingMesh = new THREE.Mesh(baseRingGeo, goldPvdMaterial);
      baseRingMesh.position.set(0, -0.41, 0);
      baseRingMesh.castShadow = true;
      modelGroup.add(baseRingMesh);

      // 5. Đồ decor điểm xuyết: Đĩa pha lê mạ vàng trên mặt bàn
      const decorTrayGeo = new THREE.CylinderGeometry(0.2, 0.16, 0.02, 32);
      const decorTray = new THREE.Mesh(decorTrayGeo, goldPvdMaterial);
      decorTray.position.set(0.15, 0.13, 0.1);
      decorTray.castShadow = true;
      modelGroup.add(decorTray);

    } else if (modelType === "dining_table") {
      // === BÀN ĂN SOVEREIGN (Mặt đá lớn, chân trụ kiến trúc đôi dát vàng) ===
      // 1. Mặt bàn lớn chữ nhật bo góc viền lượn sang trọng
      const topGeo = new THREE.BoxGeometry(2.7, 0.08, 1.15, 32, 4, 16);
      const topMesh = new THREE.Mesh(topGeo, primaryMaterial);
      topMesh.position.set(0, 0.28, 0);
      topMesh.castShadow = true;
      topMesh.receiveShadow = true;
      modelGroup.add(topMesh);

      // 2. Viền kim loại mạ vàng 24K dưới mặt bàn
      const apronGeo = new THREE.BoxGeometry(2.55, 0.03, 1.0);
      const apronMesh = new THREE.Mesh(apronGeo, goldPvdMaterial);
      apronMesh.position.set(0, 0.23, 0);
      modelGroup.add(apronMesh);

      // 3. Hai chân trụ kiến trúc đôi (Sculptural Pedestals)
      const pedestalGeo = new THREE.CylinderGeometry(0.2, 0.28, 0.62, 32);
      const pedestalLeft = new THREE.Mesh(pedestalGeo, woodBaseMaterial);
      pedestalLeft.position.set(-0.75, -0.09, 0);
      pedestalLeft.castShadow = true;
      modelGroup.add(pedestalLeft);

      const pedestalRight = new THREE.Mesh(pedestalGeo, woodBaseMaterial);
      pedestalRight.position.set(0.75, -0.09, 0);
      pedestalRight.castShadow = true;
      modelGroup.add(pedestalRight);

      // Chân đế trụ mạ vàng PVD
      const plinthLeft = new THREE.CylinderGeometry(0.35, 0.35, 0.05, 32);
      const plinthMeshLeft = new THREE.Mesh(plinthLeft, goldPvdMaterial);
      plinthMeshLeft.position.set(-0.75, -0.42, 0);
      plinthMeshLeft.castShadow = true;
      modelGroup.add(plinthMeshLeft);

      const plinthRight = new THREE.CylinderGeometry(0.35, 0.35, 0.05, 32);
      const plinthMeshRight = new THREE.Mesh(plinthRight, goldPvdMaterial);
      plinthMeshRight.position.set(0.75, -0.42, 0);
      plinthMeshRight.castShadow = true;
      modelGroup.add(plinthMeshRight);

    } else if (modelType === "chair_short") {
      // === GHẾ ĐƠN / GHẾ LOUNGE / ARMCHAIR NGẮN ===
      // 1. Đệm ngồi đơn bọc da/nhung cao cấp
      const seatGeo = new THREE.BoxGeometry(0.88, 0.28, 0.85, 16, 8, 16);
      const seatMesh = new THREE.Mesh(seatGeo, primaryMaterial);
      seatMesh.position.set(0, -0.08, 0.02);
      seatMesh.castShadow = true;
      seatMesh.receiveShadow = true;
      modelGroup.add(seatMesh);

      // 2. Tựa lưng dáng cong ôm lưng (Curved Shell Backrest)
      const backGeo = new THREE.BoxGeometry(0.88, 0.72, 0.2, 16, 12, 8);
      const backMesh = new THREE.Mesh(backGeo, primaryMaterial);
      backMesh.position.set(0, 0.36, -0.34);
      backMesh.rotation.x = -0.08;
      backMesh.castShadow = true;
      modelGroup.add(backMesh);

      // 3. Hai tay vịn thon gọn 2 bên
      const armGeo = new THREE.BoxGeometry(0.14, 0.44, 0.8, 8, 8, 12);
      const armLeft = new THREE.Mesh(armGeo, primaryMaterial);
      armLeft.position.set(-0.48, 0.16, 0.02);
      armLeft.castShadow = true;
      modelGroup.add(armLeft);

      const armRight = new THREE.Mesh(armGeo, primaryMaterial);
      armRight.position.set(0.48, 0.16, 0.02);
      armRight.castShadow = true;
      modelGroup.add(armRight);

      // 4. Gối tựa lưng nhỏ điểm xuyết
      const pillowGeo = new THREE.BoxGeometry(0.38, 0.26, 0.12);
      const pillowMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xd4af37),
        roughness: 0.6,
        metalness: 0.2,
      });
      const pillow = new THREE.Mesh(pillowGeo, pillowMat);
      pillow.position.set(0, 0.14, -0.22);
      pillow.rotation.x = -0.15;
      pillow.castShadow = true;
      modelGroup.add(pillow);

      // 5. 4 Chân ghế nghiêng mạ vàng PVD phong cách Mid-Century
      const legGeo = new THREE.CylinderGeometry(0.035, 0.018, 0.35, 16);
      const legPositions = [
        [-0.38, -0.38, 0.34, 0.15, 0, -0.15],
        [0.38, -0.38, 0.34, 0.15, 0, 0.15],
        [-0.38, -0.38, -0.32, -0.15, 0, -0.15],
        [0.38, -0.38, -0.32, -0.15, 0, 0.15],
      ];
      legPositions.forEach(([x, y, z, rx, ry, rz]) => {
        const leg = new THREE.Mesh(legGeo, goldPvdMaterial);
        leg.position.set(x, y, z);
        leg.rotation.set(rx, ry, rz);
        leg.castShadow = true;
        modelGroup.add(leg);
      });

    } else if (modelType === "bed") {
      // === GIƯỜNG NGỦ THƯỢNG LƯU (CANOPY / PLATFORM BED) ===
      // 1. Đầu giường lớn bọc nệm (Headboard)
      const headboardGeo = new THREE.BoxGeometry(2.3, 1.25, 0.22, 24, 16, 6);
      const headboardMesh = new THREE.Mesh(headboardGeo, primaryMaterial);
      headboardMesh.position.set(0, 0.45, -1.02);
      headboardMesh.castShadow = true;
      modelGroup.add(headboardMesh);

      // 2. Khung giường bao quanh
      const frameGeo = new THREE.BoxGeometry(2.1, 0.28, 2.2);
      const frameMesh = new THREE.Mesh(frameGeo, woodBaseMaterial);
      frameMesh.position.set(0, -0.18, 0.08);
      frameMesh.castShadow = true;
      modelGroup.add(frameMesh);

      // 3. Đệm ngủ êm ái
      const mattressGeo = new THREE.BoxGeometry(1.92, 0.3, 2.05, 16, 6, 16);
      const mattressMesh = new THREE.Mesh(mattressGeo, whiteFabricMaterial);
      mattressMesh.position.set(0, 0.06, 0.12);
      mattressMesh.castShadow = true;
      modelGroup.add(mattressMesh);

      // 4. Khăn trải chân giường (Duvet Runner)
      const runnerGeo = new THREE.BoxGeometry(1.94, 0.05, 0.65);
      const runnerMesh = new THREE.Mesh(runnerGeo, primaryMaterial);
      runnerMesh.position.set(0, 0.22, 0.75);
      runnerMesh.castShadow = true;
      modelGroup.add(runnerMesh);

      // 5. Gối ngủ
      const pillowGeo = new THREE.BoxGeometry(0.48, 0.18, 0.35);
      const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
      const p1 = new THREE.Mesh(pillowGeo, pillowMat);
      p1.position.set(-0.55, 0.28, -0.65);
      p1.rotation.x = 0.25;
      modelGroup.add(p1);

      const p2 = new THREE.Mesh(pillowGeo, pillowMat);
      p2.position.set(0.55, 0.28, -0.65);
      p2.rotation.x = 0.25;
      modelGroup.add(p2);

      // 6. Chân giường mạ vàng
      const legGeo = new THREE.CylinderGeometry(0.04, 0.03, 0.18, 16);
      [
        [-0.95, -0.42, 1.05],
        [0.95, -0.42, 1.05],
        [-0.95, -0.42, -0.92],
        [0.95, -0.42, -0.92],
      ].forEach((pos) => {
        const leg = new THREE.Mesh(legGeo, goldPvdMaterial);
        leg.position.set(pos[0], pos[1], pos[2]);
        leg.castShadow = true;
        modelGroup.add(leg);
      });

    } else if (modelType === "cabinet") {
      // === TỦ ÁO / TỦ KỆ / ĐẢO BẾP / BÀN LÀM VIỆC ===
      // 1. Thân tủ lớn
      const bodyGeo = new THREE.BoxGeometry(2.1, 0.72, 0.65, 24, 12, 12);
      const bodyMesh = new THREE.Mesh(bodyGeo, woodBaseMaterial);
      bodyMesh.position.set(0, -0.05, 0);
      bodyMesh.castShadow = true;
      modelGroup.add(bodyMesh);

      // 2. Mặt đá cẩm thạch trên cùng
      const marbleTopGeo = new THREE.BoxGeometry(2.18, 0.08, 0.72);
      const marbleTopMesh = new THREE.Mesh(marbleTopGeo, primaryMaterial);
      marbleTopMesh.position.set(0, 0.35, 0);
      marbleTopMesh.castShadow = true;
      modelGroup.add(marbleTopMesh);

      // 3. Tay nắm kim loại mạ vàng sang trọng
      const handleGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.24, 16);
      [-0.5, 0, 0.5].forEach((x) => {
        const handle = new THREE.Mesh(handleGeo, goldPvdMaterial);
        handle.position.set(x, -0.02, 0.35);
        modelGroup.add(handle);
      });

      // 4. Chân đế plinth bọc vàng
      const plinthGeo = new THREE.BoxGeometry(2.0, 0.1, 0.58);
      const plinth = new THREE.Mesh(plinthGeo, goldPvdMaterial);
      plinth.position.set(0, -0.45, 0);
      plinth.castShadow = true;
      modelGroup.add(plinth);

    } else {
      // === SOFA DÀI NGUYÊN BẢN (3-SEATER LUXURY CURVED SOFA) ===
      // 1. Đệm ngồi dài
      const seatGeo = new THREE.BoxGeometry(2.4, 0.35, 1.1, 16, 8, 16);
      const seatMesh = new THREE.Mesh(seatGeo, primaryMaterial);
      seatMesh.position.set(0, -0.1, 0);
      seatMesh.castShadow = true;
      seatMesh.receiveShadow = true;
      modelGroup.add(seatMesh);

      // 2. Tựa lưng êm ái
      const backGeo = new THREE.BoxGeometry(2.4, 0.65, 0.35, 16, 12, 8);
      const backMesh = new THREE.Mesh(backGeo, primaryMaterial);
      backMesh.position.set(0, 0.35, -0.42);
      backMesh.castShadow = true;
      modelGroup.add(backMesh);

      // 3. Hai tay vịn
      const armGeo = new THREE.BoxGeometry(0.3, 0.55, 1.1, 8, 8, 16);
      const armLeft = new THREE.Mesh(armGeo, primaryMaterial);
      armLeft.position.set(-1.25, 0.15, 0);
      armLeft.castShadow = true;
      modelGroup.add(armLeft);

      const armRight = new THREE.Mesh(armGeo, primaryMaterial);
      armRight.position.set(1.25, 0.15, 0);
      armRight.castShadow = true;
      modelGroup.add(armRight);

      // 4. Gối tựa nệm vàng
      const pillowGeo = new THREE.BoxGeometry(0.42, 0.42, 0.18);
      const pillowMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xd4af37),
        roughness: 0.6,
        metalness: 0.2,
      });
      const pillow1 = new THREE.Mesh(pillowGeo, pillowMat);
      pillow1.position.set(-0.9, 0.22, -0.22);
      pillow1.rotation.set(0.1, 0.35, 0.15);
      pillow1.castShadow = true;
      modelGroup.add(pillow1);

      const pillow2 = new THREE.Mesh(pillowGeo, pillowMat);
      pillow2.position.set(0.9, 0.22, -0.22);
      pillow2.rotation.set(0.1, -0.35, -0.15);
      pillow2.castShadow = true;
      modelGroup.add(pillow2);

      // 5. Chân đế gỗ & 4 chân mạ vàng
      const plinthGeo = new THREE.BoxGeometry(2.55, 0.1, 1.2);
      const plinthMesh = new THREE.Mesh(plinthGeo, woodBaseMaterial);
      plinthMesh.position.set(0, -0.32, 0);
      plinthMesh.castShadow = true;
      modelGroup.add(plinthMesh);

      const legGeo = new THREE.CylinderGeometry(0.04, 0.025, 0.25, 16);
      [
        [-1.15, -0.45, 0.45],
        [1.15, -0.45, 0.45],
        [-1.15, -0.45, -0.45],
        [1.15, -0.45, -0.45],
      ].forEach((pos) => {
        const leg = new THREE.Mesh(legGeo, goldPvdMaterial);
        leg.position.set(pos[0], pos[1], pos[2]);
        leg.castShadow = true;
        modelGroup.add(leg);
      });
    }

    scene.add(modelGroup);

    // Look at scene origin
    camera.lookAt(0, 0, 0);
    setLoading(false);

    // 7. Animation / Render Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate && modelGroupRef.current && !isDraggingRef.current) {
        modelGroupRef.current.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight || 480;

      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [modelType]);

  // Update 3D Materials when color variant changes
  const handleSelectVariant = (variant: ColorVariant) => {
    setSelectedVariant(variant);

    if (mainMaterialsRef.current.length > 0) {
      mainMaterialsRef.current.forEach((mat) => {
        mat.color.set(variant.colorHex);
        if (variant.material === "marble") {
          mat.roughness = 0.15;
          mat.metalness = 0.08;
        } else if (variant.material === "velvet") {
          mat.roughness = 0.75;
          mat.metalness = 0.05;
        } else if (variant.material === "wood") {
          mat.roughness = 0.55;
          mat.metalness = 0.05;
        } else {
          mat.roughness = 0.42;
          mat.metalness = 0.1;
        }
        mat.needsUpdate = true;
      });
    }

    if (onVariantChange) {
      onVariantChange(variant, basePrice + (variant.priceDiff || 0));
    }
  };

  // Camera Presets
  const setCameraView = (angle: "hero" | "front" | "top") => {
    if (!cameraRef.current || !modelGroupRef.current) return;
    setActiveCameraAngle(angle);

    // Reset model rotation to face correctly
    modelGroupRef.current.rotation.set(0, 0, 0);

    if (angle === "hero") {
      const [hx, hy, hz] = modelConfig.heroPos;
      cameraRef.current.position.set(hx / zoomLevel, hy / zoomLevel, hz / zoomLevel);
    } else if (angle === "front") {
      const [fx, fy, fz] = modelConfig.frontPos;
      cameraRef.current.position.set(fx, fy / zoomLevel, fz / zoomLevel);
    } else if (angle === "top") {
      const [tx, ty, tz] = modelConfig.topPos;
      cameraRef.current.position.set(tx, ty / zoomLevel, tz / zoomLevel);
    }
    cameraRef.current.lookAt(0, 0, 0);
  };

  // Zoom controls
  const handleZoom = (factor: number) => {
    if (!cameraRef.current) return;
    const newZoom = Math.max(0.6, Math.min(2.0, zoomLevel * factor));
    setZoomLevel(newZoom);
    cameraRef.current.position.multiplyScalar(factor);
  };

  // Touch and Mouse Orbit Interaction
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !modelGroupRef.current) return;

    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    modelGroupRef.current.rotation.y += deltaX * 0.008;
    modelGroupRef.current.rotation.x = Math.max(
      -0.4,
      Math.min(0.6, modelGroupRef.current.rotation.x + deltaY * 0.005)
    );

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      className={`relative bg-gradient-to-b from-[#F5F2EB] to-[#EAE4D7] border border-gold/40 rounded-3xl overflow-hidden shadow-2xl ${className}`}
    >
      {/* 3D Canvas Workspace */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative w-full h-[380px] sm:h-[460px] md:h-[540px] cursor-grab active:cursor-grabbing select-none flex items-center justify-center"
      >
        <canvas ref={canvasRef} className="w-full h-full block touch-none" />

        {/* Loading Skeleton */}
        {loading && (
          <div className="absolute inset-0 bg-sand/80 backdrop-blur-md flex flex-col items-center justify-center space-y-4 z-30">
            <div className="w-12 h-12 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
            <p className="font-serif text-espresso text-xs tracking-widest2 uppercase">
              Đang kết xuất mô hình 3D WebGL...
            </p>
          </div>
        )}

        {/* Top Badges & Realtime Price HUD */}
        <div className="absolute top-5 left-5 right-5 flex items-center justify-between pointer-events-none z-20">
          <div className="bg-espresso/90 backdrop-blur-md text-beige px-3.5 py-1.5 rounded-full border border-gold/40 text-xs font-serif flex items-center gap-2 shadow-lg">
            <Sparkles size={14} className="text-gold" />
            <span>3D Interactive Studio</span>
          </div>

          <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-gold/50 shadow-lg text-right">
            <span className="text-[10px] text-espresso/60 block uppercase tracking-wider">
              Giá phiên bản đang chọn
            </span>
            <span className="font-serif text-gold font-bold text-base md:text-lg">
              {formatPrice(currentPrice)}
            </span>
          </div>
        </div>

        {/* Left Floating Camera Presets */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
          <button
            onClick={() => setCameraView("hero")}
            title="Góc nghiêng 45° Hero"
            className={`p-2.5 rounded-xl border backdrop-blur-md transition-all text-xs font-medium flex items-center gap-1.5 shadow-md ${
              activeCameraAngle === "hero"
                ? "bg-espresso text-gold border-gold scale-105"
                : "bg-white/70 text-espresso/70 border-espresso/15 hover:bg-white"
            }`}
          >
            <Camera size={14} />
            <span className="hidden sm:inline">Góc Nghiêng</span>
          </button>

          <button
            onClick={() => setCameraView("front")}
            title="Góc chính diện"
            className={`p-2.5 rounded-xl border backdrop-blur-md transition-all text-xs font-medium flex items-center gap-1.5 shadow-md ${
              activeCameraAngle === "front"
                ? "bg-espresso text-gold border-gold scale-105"
                : "bg-white/70 text-espresso/70 border-espresso/15 hover:bg-white"
            }`}
          >
            <Eye size={14} />
            <span className="hidden sm:inline">Chính Diện</span>
          </button>

          <button
            onClick={() => setCameraView("top")}
            title="Nhìn từ trên xuống"
            className={`p-2.5 rounded-xl border backdrop-blur-md transition-all text-xs font-medium flex items-center gap-1.5 shadow-md ${
              activeCameraAngle === "top"
                ? "bg-espresso text-gold border-gold scale-105"
                : "bg-white/70 text-espresso/70 border-espresso/15 hover:bg-white"
            }`}
          >
            <Layers size={14} />
            <span className="hidden sm:inline">Từ Trên</span>
          </button>
        </div>

        {/* Right Floating Zoom & Rotation Tools */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title={autoRotate ? "Tạm dừng tự động xoay" : "Bật tự động xoay 360°"}
            className="p-2.5 rounded-xl bg-white/80 backdrop-blur-md border border-espresso/15 text-espresso hover:border-gold hover:text-gold shadow-md transition-all"
          >
            {autoRotate ? <Pause size={15} /> : <Play size={15} />}
          </button>

          <button
            onClick={() => handleZoom(0.85)}
            title="Phóng to"
            className="p-2.5 rounded-xl bg-white/80 backdrop-blur-md border border-espresso/15 text-espresso hover:border-gold hover:text-gold shadow-md transition-all"
          >
            <ZoomIn size={15} />
          </button>

          <button
            onClick={() => handleZoom(1.15)}
            title="Thu nhỏ"
            className="p-2.5 rounded-xl bg-white/80 backdrop-blur-md border border-espresso/15 text-espresso hover:border-gold hover:text-gold shadow-md transition-all"
          >
            <ZoomOut size={15} />
          </button>

          <button
            onClick={() => setArOpen(true)}
            title="Xem trong không gian thực qua Camera (AR)"
            className="p-2.5 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-charcoal border border-white font-bold shadow-lg hover:scale-105 transition-all"
          >
            <Smartphone size={16} />
          </button>
        </div>

        {/* Bottom Hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-espresso/75 backdrop-blur-md text-champagne px-4 py-1.5 rounded-full text-[11px] pointer-events-none tracking-wider shadow-md">
          ↔ Kéo chuột hoặc vuốt để xoay 360°
        </div>
      </div>

      {/* Material & Color Variant Selector Bar */}
      <div className="bg-white/90 backdrop-blur-md border-t border-gold/30 p-5 md:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest2 text-espresso font-bold">
            {modelConfig.variantLabel}:{" "}
            <strong className="text-gold font-serif text-sm ml-1 font-semibold">
              {selectedVariant.name}
            </strong>
          </span>
          <span className="text-[11px] text-espresso/60 hidden sm:inline">
            ✨ Cập nhật vân bề mặt 3D tức thì
          </span>
        </div>

        {/* Color Swatch Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {activeVariants.map((v) => {
            const isSelected = selectedVariant.id === v.id;
            return (
              <button
                key={v.id}
                onClick={() => handleSelectVariant(v)}
                className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "border-gold bg-gold/15 shadow-md scale-102"
                    : "border-espresso/10 hover:border-gold/50 bg-sand/30"
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full border border-black/15 shadow-inner shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: v.previewColor }}
                >
                  {isSelected && (
                    <Check
                      size={14}
                      className={
                        v.id.includes("cream") || v.id.includes("white") || v.id.includes("linen")
                          ? "text-charcoal"
                          : "text-white"
                      }
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-espresso truncate">{v.name}</div>
                  <div className="text-[10px] text-espresso/60 font-serif">
                    {v.priceDiff === 0
                      ? "Tiêu chuẩn"
                      : v.priceDiff && v.priceDiff > 0
                      ? `+${formatPrice(v.priceDiff)}`
                      : `-${formatPrice(Math.abs(v.priceDiff || 0))}`}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* AR Space Quick Look Modal Overlay */}
      {arOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-2xl bg-charcoal text-beige border border-gold/40 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6">
            <button
              onClick={() => setArOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-beige transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gold/20 text-gold flex items-center justify-center">
                <Smartphone size={20} />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-champagne">
                  Trải Nghiệm Thực Tế Tăng Cường (AR Quick Look)
                </h3>
                <p className="text-xs text-beige/60">
                  Ướm thử kích thước thật của {productName} vào không gian sống của bạn
                </p>
              </div>
            </div>

            {/* Simulated AR Camera Viewport */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-gold/30 bg-black/60 flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />

              <div className="relative z-10 text-center space-y-3 p-6 bg-charcoal/85 backdrop-blur-md rounded-2xl border border-white/10 max-w-sm">
                <div className="text-3xl animate-bounce">📱</div>
                <div className="text-sm font-serif font-bold text-gold">
                  Kích thước thực tế: {modelConfig.dimensions}
                </div>
                <p className="text-xs text-beige/70">
                  Quét mã QR bằng điện thoại iPhone (iOS AR QuickLook) hoặc Android (Scene Viewer) để đặt sản phẩm vào phòng qua Camera.
                </p>
                <div className="p-3 bg-white text-charcoal rounded-xl inline-block font-mono text-[11px] font-bold">
                  [GS-LUXURY-AR-{modelType.toUpperCase()}]
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 text-xs text-beige/70">
              <span>Độ chính xác kích thước 99.8%</span>
              <button
                onClick={() => setArOpen(false)}
                className="px-6 py-2.5 bg-gold text-charcoal font-bold rounded-xl font-serif tracking-wider uppercase text-xs cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
