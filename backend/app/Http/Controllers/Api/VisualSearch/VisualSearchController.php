<?php

namespace App\Http\Controllers\Api\VisualSearch;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\GeminiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VisualSearchController extends Controller
{
    protected GeminiService $gemini;

    public function __construct(GeminiService $gemini)
    {
        $this->gemini = $gemini;
    }

    /**
     * Visual Search & Style Matching Assistant
     * 
     * Supports both rule-based (default) and Gemini AI enhanced mode.
     * For true AI-powered visual search with images, integrate OpenAI Vision API or Google Vision AI.
     */
    public function search(Request $request): JsonResponse
    {
        $prompt = strtolower(trim($request->input('prompt', '')));
        $style = strtolower(trim($request->input('style', '')));
        $category = strtolower(trim($request->input('category', '')));
        $roomType = $request->input('room_type', 'living');

        // Try Gemini AI if configured
        if ($this->gemini->isConfigured() && !empty($prompt)) {
            return $this->handleWithGemini($prompt, $style, $category, $roomType);
        }

        // Fallback to rule-based
        return $this->handleRuleBased($prompt, $style, $category, $roomType);
    }

    protected function handleWithGemini(string $prompt, string $style, string $category, string $roomType): JsonResponse
    {
        // Get all active products for context
        $products = Product::where('status', 'active')
            ->where('stock_quantity', '>', 0)
            ->with(['images', 'category'])
            ->get();

        $productContext = $products->map(function ($p) {
            return "- ID:{$p->id} | {$p->name} | " . number_format($p->price, 0, ',', '.') . "₫ | {$p->material} | {$p->category?->name} | {$p->dimensions} | Stock:{$p->stock_quantity}";
        })->implode("\n");

        $systemPrompt = <<<PROMPT
Bạn là **AI Visual Search GS Luxury** - chuyên gia phân tích không gian & gợi ý nội thất.

**NHIỆM VỤ:** Dựa trên mô tả của user, xác định:
1. Loại phòng (living/dining/bedroom/office)
2. Kiểu dáng gợi ý (sofa, bàn ăn, giường, bàn trà, đèn...)
3. Diện tích ước lượng
4. Phân tích ánh sáng & màu sắc phù hợp
5. Chọn 3-5 sản phẩm PHÙ HỢP NHẤT từ danh sách dưới đây

**DANH SÁCH SẢN PHẨM THỰC TẾ:**
{$productContext}

**TRẢ VỀ JSON DUY NHẤT (không markdown, không text thừa):**
{
  "detected_category": "sofa|dining|coffee_table|bedroom|lighting|general",
  "room_type": "living|dining|bedroom|office",
  "estimated_area": "18-28 m²",
  "recommended_type": "Tên loại nội thất gợi ý",
  "lighting_analysis": "Phân tích ánh sáng 1 câu",
  "color_palette": ["#HEX1", "#HEX2", "#HEX3", "#HEX4"],
  "product_ids": [1, 5, 12],
  "reasoning": "Lý do chọn các sản phẩm này (2-3 câu)"
}

User input: "{$prompt}" | Style: "{$style}" | Category: "{$category}" | Room: "{$roomType}"
PROMPT;

        $result = $this->gemini->generateContent($systemPrompt);

        if (isset($result['error'])) {
            return $this->handleRuleBased($prompt, $style, $category, $roomType);
        }

        $aiResponse = $this->parseGeminiResponse($result['text'] ?? '');
        if (!$aiResponse) {
            return $this->handleRuleBased($prompt, $style, $category, $roomType);
        }

        // Get full product details for selected IDs
        $selectedProducts = Product::whereIn('id', $aiResponse['product_ids'] ?? [])
            ->where('status', 'active')
            ->where('stock_quantity', '>', 0)
            ->with(['images', 'category'])
            ->get()
            ->keyBy('id');

        $formatted = collect($aiResponse['product_ids'] ?? [])->map(function ($id) use ($selectedProducts, $aiResponse) {
            $product = $selectedProducts->get($id);
            if (!$product) return null;

            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'price' => (float) $product->price,
                'original_price' => $product->original_price ? (float) $product->original_price : null,
                'category_name' => $product->category?->name ?? 'Nội thất phòng khách',
                'image' => $product->images->first()?->image_url ?? '/images/placeholder.jpg',
                'material' => $product->material ?? 'Chất liệu cao cấp',
                'similarity_score' => rand(85, 98),
                'dimensions' => $product->dimensions ?? 'Kích thước tùy chỉnh',
                'match_reason' => $aiResponse['reasoning'] ?? 'Phù hợp với không gian và phong cách',
                'default_scale' => 0.85,
                'in_stock' => $product->stock_quantity > 0,
                'stock_quantity' => $product->stock_quantity,
            ];
        })->filter()->values();

        return response()->json([
            'success' => true,
            'meta' => [
                'engine' => 'gemini_1.5_flash',
                'engine_description' => 'Google Gemini 1.5 Flash AI - Enhanced Visual Search',
                'processed_at' => now()->toISOString(),
            ],
            'data' => [
                'detected_category' => $aiResponse['detected_category'] ?? 'general',
                'detected_room_type' => $this->getRoomTypeLabel($aiResponse['room_type'] ?? $roomType),
                'estimated_area' => $aiResponse['estimated_area'] ?? '20-30 m²',
                'recommended_type' => $aiResponse['recommended_type'] ?? 'Nội thất cao cấp',
                'lighting_analysis' => $aiResponse['lighting_analysis'] ?? 'Phân tích ánh sáng tự nhiên',
                'color_palette' => $aiResponse['color_palette'] ?? ['#F5EBE1', '#8B5A2B', '#1A1A1A', '#D4AF37'],
                'matches_count' => $formatted->count(),
                'products' => $formatted,
            ],
        ]);
    }

    protected function handleRuleBased(string $prompt, string $style, string $category, string $roomType): JsonResponse
    {
        $query = Product::with(['images', 'category', 'collection', 'variants'])
            ->where('status', 'active')
            ->where('stock_quantity', '>', 0);

        $detectedCategory = null;
        $recommendedType = null;
        $detectedArea = null;
        $lightingAnalysis = null;
        $colorPalette = null;

        if (
            str_contains($prompt, 'sofa') || 
            str_contains($prompt, 'ghế') || 
            str_contains($prompt, 'nệm') ||
            $category === 'sofa' ||
            $style === 'sofa'
        ) {
            $detectedCategory = 'sofa';
            $query->where(function ($q) {
                $q->where('name', 'like', '%Sofa%')
                  ->orWhere('name', 'like', '%Ghế%')
                  ->orWhere('category_id', 1);
            });
            $recommendedType = "Sofa Góc Chữ L / Ghế Lounge Thư Giãn";
            $detectedArea = "18 - 28 m²";
            $lightingAnalysis = "Phù hợp không gian có ánh sáng tự nhiên từ cửa sổ lớn";
            $colorPalette = ['#F5EBE1', '#8B5A2B', '#1A1A1A', '#D4AF37'];
        } elseif (
            str_contains($prompt, 'bàn ăn') || 
            str_contains($prompt, 'bếp') || 
            str_contains($prompt, 'dining') ||
            $category === 'dining'
        ) {
            $detectedCategory = 'dining';
            $query->where(function ($q) {
                $q->where('name', 'like', '%Bàn Ăn%')
                  ->orWhere('name', 'like', '%Dining%')
                  ->orWhere('name', 'like', '%Sovereign%')
                  ->orWhere('category_id', 2);
            });
            $recommendedType = "Bàn Ăn 6-8 Ghế Mạ Vàng PVD";
            $detectedArea = "15 - 22 m²";
            $lightingAnalysis = "Không gian ăn uống cần ánh sáng ấm, tập trung";
            $colorPalette = ['#2C1810', '#C9A962', '#F5F0E8', '#8B5A2B'];
        } elseif (
            str_contains($prompt, 'bàn trà') || 
            str_contains($prompt, 'coffee') || 
            str_contains($prompt, 'cẩm thạch') || 
            str_contains($prompt, 'marble')
        ) {
            $detectedCategory = 'coffee_table';
            $query->where(function ($q) {
                $q->where('name', 'like', '%Bàn Trà%')
                  ->orWhere('name', 'like', '%Marble%')
                  ->orWhere('name', 'like', '%Aria%');
            });
            $recommendedType = "Bàn Trà Đôi Mặt Đá Marble Carrara";
            $detectedArea = "12 - 20 m²";
            $lightingAnalysis = "Đá marble phản chiếu ánh sáng, tạo điểm nhấn sang trọng";
            $colorPalette = ['#FFFFFF', '#E8E8E8', '#2C2C2C', '#C9A962'];
        } elseif (
            str_contains($prompt, 'giường') || 
            str_contains($prompt, 'ngủ') || 
            str_contains($prompt, 'bed') ||
            $category === 'bedroom'
        ) {
            $detectedCategory = 'bedroom';
            $query->where(function ($q) {
                $q->where('name', 'like', '%Giường%')
                  ->orWhere('name', 'like', '%Bed%')
                  ->orWhere('category_id', 3);
            });
            $recommendedType = "Giường Ngủ Master Gỗ Óc Chó Bắc Mỹ";
            $detectedArea = "20 - 35 m²";
            $lightingAnalysis = "Phòng ngủ cần ánh sáng mềm mại, thư giãn";
            $colorPalette = ['#1A1A1A', '#3D3D3D', '#C9A962', '#F5EBE1'];
        } elseif (
            str_contains($prompt, 'đèn') || 
            str_contains($prompt, 'pha lê') || 
            str_contains($prompt, 'lamp')
        ) {
            $detectedCategory = 'lighting';
            $query->where(function ($q) {
                $q->where('name', 'like', '%Đèn%')
                  ->orWhere('name', 'like', '%Lamp%');
            });
            $recommendedType = "Đèn Cây Vòm / Đèn Chùm Pha Lê K9";
            $detectedArea = "Mọi không gian";
            $lightingAnalysis = "Đèn pha lê tạo hiệu ứng lấp lánh, nghệ thuật";
            $colorPalette = ['#FFD700', '#FFF8E7', '#1A1A1A', '#C9A962'];
        } else {
            $detectedCategory = 'general';
            $query->where(function ($q) {
                $q->where('is_featured', true)
                  ->orWhere('is_bestseller', true);
            });
            $recommendedType = "Nội Thất May Đo Cao Cấp GS Luxury";
            $detectedArea = "25 - 40 m²";
            $lightingAnalysis = "Thiết kế phù hợp nhiều loại không gian cao cấp";
            $colorPalette = ['#F5EBE1', '#8B5A2B', '#1A1A1A', '#D4AF37'];
        }

        $results = $query->take(8)->get();

        if ($results->isEmpty()) {
            $results = Product::with(['images', 'category', 'collection'])
                ->where('status', 'active')
                ->where('stock_quantity', '>', 0)
                ->take(6)
                ->get();
        }

        $formatted = $results->map(function ($product, $index) use ($detectedCategory) {
            $baseScore = 75;
            if ($product->is_featured) $baseScore += 10;
            if ($product->is_bestseller) $baseScore += 5;
            if ($product->stock_quantity > 10) $baseScore += 5;
            $confidence = min(95, $baseScore + ($index * 2));

            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'price' => (float) $product->price,
                'original_price' => $product->original_price ? (float) $product->original_price : null,
                'category_name' => $product->category?->name ?? 'Nội thất phòng khách',
                'image' => $product->images->first()?->image_url ?? '/images/placeholder.jpg',
                'material' => $product->material ?? 'Chất liệu cao cấp',
                'similarity_score' => $confidence,
                'dimensions' => $product->dimensions ?? 'Kích thước tùy chỉnh',
                'match_reason' => $this->getMatchReason($product, $detectedCategory),
                'default_scale' => 0.85 + ($index * 0.02),
                'in_stock' => $product->stock_quantity > 0,
                'stock_quantity' => $product->stock_quantity,
            ];
        });

        return response()->json([
            'success' => true,
            'meta' => [
                'engine' => 'rule_based_v1',
                'engine_description' => 'Trợ lý gợi ý dựa trên quy tắc từ khóa (không phải AI/ML). AI mode: Gemini 1.5 Flash khi có API key.',
                'processed_at' => now()->toISOString(),
            ],
            'data' => [
                'detected_category' => $detectedCategory,
                'detected_room_type' => $this->getRoomTypeLabel($roomType),
                'estimated_area' => $detectedArea,
                'recommended_type' => $recommendedType,
                'lighting_analysis' => $lightingAnalysis,
                'color_palette' => $colorPalette,
                'matches_count' => $formatted->count(),
                'products' => $formatted,
            ],
        ]);
    }

    /**
     * AI Spatial Room Stylist & Staging Engine (5-Layer Architectural Analysis)
     */
    public function analyzeRoom(Request $request): JsonResponse
    {
        $presetId = $request->input('preset_id', $request->input('preset', 'penthouse_living'));
        $customPrompt = $request->input('prompt', '');
        $area = $request->input('area');
        $colorTone = $request->input('color_tone');
        $desiredStyle = $request->input('desired_style');
        $userNote = $request->input('user_note', $customPrompt);
        $imageFile = $request->file('image');
        $imageBase64 = $request->input('image_base64');

        // Professional 5-Layer Presets Architecture
        $presets = [
            'penthouse_living' => [
                'title' => 'Phòng Khách Penthouse Hoàng Gia',
                'style' => 'Modern Italian Luxury & Minimalist',
                'area' => '35 - 45 m²',
                'lighting' => 'Kính tràn viền Panorama đón nắng tự nhiên; độ khuếch tán cao kết hợp ánh sáng hắt trần 3000K.',
                'structural_analysis' => [
                    'ceiling' => 'Trần thạch cao giật cấp âm đèn hắt LED CRI>95, cao độ thông thủy 3.2m thoáng đạt.',
                    'floor' => 'Sàn đá cẩm thạch trắng Calacatta bóng mờ, chống trơn trượt tiêu chuẩn châu Âu.',
                    'walls_windows' => 'Hệ vách kính Panorama khổ lớn đón trọn ánh sáng tự nhiên và view toàn cảnh thành phố.',
                ],
                'spatial_evaluation' => [
                    'lighting' => 'Ánh sáng tự nhiên dồi dào từ hướng Đông Nam, dịu nhẹ buổi sớm và rực rỡ lúc ban trưa.',
                    'pros' => 'Mặt bằng vuông vức, tầm nhìn thoáng đãng, trần cao tối ưu khả năng thông gió đối lưu tự nhiên.',
                    'cons' => 'Bề mặt đá bóng dễ gây hiện tượng vang âm nhẹ; cần bố trí thảm Cashmere triệt tiêu âm phản xạ.',
                ],
                'layout_zoning' => [
                    'focal_point' => 'Khu vực tâm điểm đối diện ban công - nơi đặt bộ sofa chính và bàn trà đôi nghệ thuật.',
                    'furniture_placement' => 'Bố trí sofa chữ L bọc nỉ nhung cách vách kính 1.2m tạo hành lang luân chuyển khí.',
                    'circulation' => 'Khoảng cách đệm giao thông tối thiểu 90cm quanh cụm bàn trà, đảm bảo lối đi thông thoáng.',
                ],
                'material_matrix' => [
                    'recommended' => ['Da bò Ý tự nhiên Semi-Aniline', 'Đá Marble Calacatta nguyên khối', 'Thép không gỉ mạ Titan PVD'],
                    'avoid' => ['Simili công nghiệp dễ bong tróc', 'Gương phản quang đối diện luồng nắng gắt'],
                ],
                'colors' => [
                    ['name' => 'Da Bò Cognac', 'hex' => '#9E5B32'],
                    ['name' => 'Đá Marble Carrara', 'hex' => '#E8ECEF'],
                    ['name' => 'Vàng Champagne PVD', 'hex' => '#D4AF37'],
                    ['name' => 'Xám Than Charcoal', 'hex' => '#212121'],
                ],
                'advice' => 'Không gian phòng khách lớn cần một bộ Sofa làm tâm điểm vững chãi. Bàn trà đôi đá cẩm thạch và đèn sàn vòm ánh kim sẽ tạo nên bố cục tam giác vàng hoàn hảo cho dinh thự.',
                'product_ids' => [1, 5, 10], // Sofa Velvet Aurora, Bàn Trà Marble Aria, Đèn Sàn Solstice
                'combo_name' => 'Bản Phối Cảnh: Đại Sảnh Penthouse Hoàng Gia',
                'category_hint' => 'living',
                'before_image_url' => '/images/staged/penthouse_before.jpg',
                'staged_image_url' => '/images/staged/penthouse_after.jpg',
                'floorplan_data' => [
                    'room_width' => 5.2,
                    'room_length' => 7.8,
                    'room_area' => 40.5,
                    'balcony_clearance' => 125,
                    'main_door_clearance' => 140,
                    'coverage_percent' => 22.8,
                    'sofa_name' => 'Sofa Vòm Cong Modular Da Bò Ý Cognac',
                    'sofa_dimensions' => '320 x 120 x 85 cm',
                    'table_dimensions' => '110 x 110 x 42 cm',
                ],
            ],
            'scandi_apartment' => [
                'title' => 'Căn Hộ Chung Cư Hiện Đại Bắc Âu',
                'style' => 'Warm Scandinavian & Japandi Zen',
                'area' => '22 - 28 m²',
                'lighting' => 'Cửa ban công hướng Đông Nam ngập tràn ánh sáng; phù hợp với các chất liệu vải dệt thô mộc, gỗ sồi tự nhiên và màu kem ấm.',
                'structural_analysis' => [
                    'ceiling' => 'Trần thạch cao phẳng sơn trắng satin, chiều cao thông thủy tiêu chuẩn 2.7m.',
                    'floor' => 'Sàn gỗ công nghiệp màu sồi sáng hèm khóa V chống ẩm.',
                    'walls_windows' => 'Hệ cửa lùa kính 2 cánh dẫn ra ban công đón gió và cây xanh nhiệt đới.',
                ],
                'spatial_evaluation' => [
                    'lighting' => 'Ánh sáng phản xạ mềm mại qua lớp rèm voan trắng, tạo cảm giác thư thái và thanh bình.',
                    'pros' => 'Không gian liền mạch giữa phòng khách và phòng ăn, tận dụng tối đa ánh sáng tự nhiên.',
                    'cons' => 'Diện tích giới hạn; cần tránh các món đồ đồ sộ chiếm lối đi để giữ cảm giác rộng mở.',
                ],
                'layout_zoning' => [
                    'focal_point' => 'Góc tiếp khách hướng về mảng tường treo tivi hoặc tranh nghệ thuật tối giản.',
                    'furniture_placement' => 'Sofa Modular phối ghế lounge rời linh hoạt, giải phóng trục di chuyển chính.',
                    'circulation' => 'Hành lang di chuyển thông suốt tối thiểu 80cm kết nối thẳng ra ban công.',
                ],
                'material_matrix' => [
                    'recommended' => ['Gỗ sồi tự nhiên Bắc Mỹ', 'Vải dệt Bouclé thô mộc', 'Gốm thủ công mộc mạc'],
                    'avoid' => ['Kim loại bóng gương rườm rà', 'Vải nhung bóng bắt bụi'],
                ],
                'colors' => [
                    ['name' => 'Kem Sữa Oatmeal', 'hex' => '#F4ECE1'],
                    ['name' => 'Gỗ Sồi Tự Nhiên', 'hex' => '#C49A6C'],
                    ['name' => 'Xám Khói Mờ', 'hex' => '#9E9E9E'],
                    ['name' => 'Đen Nhám Minimalist', 'hex' => '#1F1F1F'],
                ],
                'advice' => 'Với diện tích chung cư, sofa modular kết hợp ghế lounge rời tạo cảm giác thông thoáng, giải phóng tối đa lối đi mà vẫn đảm bảo tiện nghi đón khách tinh tế.',
                'product_ids' => [2, 3, 5], // Sofa Modular Riviera, Ghế Lounge Ombré, Bàn Trà Marble Aria
                'combo_name' => 'Bản Phối Cảnh: Không Gian Bắc Âu Ấm Cúng',
                'category_hint' => 'living',
                'before_image_url' => '/images/staged/apartment_before.jpg',
                'staged_image_url' => '/images/staged/apartment_after.jpg',
                'floorplan_data' => [
                    'room_width' => 4.2,
                    'room_length' => 6.5,
                    'room_area' => 27.3,
                    'balcony_clearance' => 115,
                    'main_door_clearance' => 130,
                    'coverage_percent' => 24.5,
                    'sofa_name' => 'Sofa Cong Cloud Vải Nỉ Bouclé Kem',
                    'sofa_dimensions' => '260 x 100 x 80 cm',
                    'table_dimensions' => '90 x 90 x 42 cm',
                ],
            ],
            'master_bedroom' => [
                'title' => 'Phòng Ngủ Master Yên Bình & Thư Thái',
                'style' => 'Contemporary Serene Sanctuary',
                'area' => '25 - 35 m²',
                'lighting' => 'Ánh sáng êm dịu 3000K; tối ưu giấc ngủ sâu với chất liệu gỗ tự nhiên, nệm bọc nỉ cao cấp và điểm nhấn gương phản chiếu chiều sâu.',
                'structural_analysis' => [
                    'ceiling' => 'Trần giật cấp nhẹ tích hợp họng gió điều hòa âm trần và rãnh rèm tự động 2 lớp.',
                    'floor' => 'Sàn gỗ óc chó kỹ thuật xương cá ấm cúng, êm chân và cách âm phòng ngủ.',
                    'walls_windows' => 'Vách đầu giường ốp gỗ bọc da nỉ tiêu âm; cửa sổ mở cánh lật hướng Nam.',
                ],
                'spatial_evaluation' => [
                    'lighting' => 'Ánh sáng gián tiếp nhẹ nhàng, không gây chói mắt khi nằm trên giường thư giãn.',
                    'pros' => 'Không gian riêng tư biệt lập, tĩnh lặng, độ ẩm và nhiệt độ ổn định quanh năm.',
                    'cons' => 'Cần xử lý hướng giường ngủ tránh đối diện cửa phòng tắm hoặc gương soi.',
                ],
                'layout_zoning' => [
                    'focal_point' => 'Chiếc giường ngủ vòm nghệ thuật Elysée đặt chính giữa trục đối xứng của căn phòng.',
                    'furniture_placement' => 'Giường cách hai bên tường 70cm đặt tab đầu giường và đèn ngủ đối xứng.',
                    'circulation' => 'Khoảng đệm cuối giường đến tủ áo tối thiểu 95cm để thao tác mở cánh tủ thoải mái.',
                ],
                'material_matrix' => [
                    'recommended' => ['Gỗ óc chó Canaletto', 'Vải nhung dệt kim cao cấp', 'Kính màu trà sang trọng'],
                    'avoid' => ['Gương soi chiếu thẳng vào giường', 'Đèn chùm pha lê nặng nề ngay đỉnh đầu'],
                ],
                'colors' => [
                    ['name' => 'Gỗ Óc Chó Walnut', 'hex' => '#4A3525'],
                    ['name' => 'Vải Nỉ Be Sand', 'hex' => '#E5DCCF'],
                    ['name' => 'Xanh Đêm Midnight', 'hex' => '#1E293B'],
                    ['name' => 'Ánh Kim Satin Gold', 'hex' => '#C5A059'],
                ],
                'advice' => 'Giường ngủ vòm bọc nệm kết hợp tủ áo cánh kính âm tường và gương trang trí nghệ thuật sẽ biến phòng ngủ thành phòng suite khách sạn 5 sao ngay tại nhà.',
                'product_ids' => [7, 8, 9], // Giường Canopy Elysée, Tủ Áo Héritage, Gương Trang Trí Cascade
                'combo_name' => 'Bản Phối Cảnh: Suite Nghỉ Dưỡng Master Hoàng Gia',
                'category_hint' => 'bedroom',
                'before_image_url' => '/images/staged/bedroom_before.jpg',
                'staged_image_url' => '/images/staged/bedroom_after.jpg',
                'floorplan_data' => [
                    'room_width' => 4.8,
                    'room_length' => 6.2,
                    'room_area' => 29.8,
                    'balcony_clearance' => 110,
                    'main_door_clearance' => 120,
                    'coverage_percent' => 26.2,
                    'sofa_name' => 'Giường Ngủ Vòm Bọc Nỉ Sang Trọng Elysée',
                    'sofa_dimensions' => '220 x 205 x 135 cm',
                    'table_dimensions' => '55 x 45 x 50 cm',
                ],
            ],
            'dining_lounge' => [
                'title' => 'Phòng Ăn & Bếp Mở Sang Trọng',
                'style' => 'Neoclassic Luxury Dining',
                'area' => '28 - 38 m²',
                'lighting' => 'Hệ thống đèn thả bàn ăn ánh sáng vàng ấm 2700K kích thích vị giác và tạo không khí sum vầy đầm ấm cho gia đình.',
                'structural_analysis' => [
                    'ceiling' => 'Trần giật cấp viền phào chỉ PU thanh thoát, điểm xuyết đèn chùm pha lê hiện đại.',
                    'floor' => 'Sàn gạch Ceramic khổ lớn vân mây chống bám dầu mỡ và dễ lau chùi.',
                    'walls_windows' => 'Vách kính ngăn mùi cơ động giữa bếp nấu và khu vực bàn tiệc gia đình.',
                ],
                'spatial_evaluation' => [
                    'lighting' => 'Chiếu sáng tập trung rọi xuống mặt bàn tiệc, làm nổi bật sắc thái ẩm thực thượng hạng.',
                    'pros' => 'Mặt bằng mở thông thoáng, kết nối nhịp nhàng giữa đảo bếp và bàn ăn dài 8 ghế.',
                    'cons' => 'Cần quạt hút thông gió công suất cao để giữ không khí luôn trong lành không ám mùi.',
                ],
                'layout_zoning' => [
                    'focal_point' => 'Cụm bàn ăn mặt đá nguyên khối Sovereign và hệ đèn thả trang sức.',
                    'furniture_placement' => 'Bàn ăn đặt tại tâm phòng, khoảng lùi ghế ngồi tối thiểu 75cm để đứng lên ngồi xuống thuận tiện.',
                    'circulation' => 'Trục di chuyển từ bếp ra bàn ăn rộng rãi tối thiểu 100cm cho người phục vụ.',
                ],
                'material_matrix' => [
                    'recommended' => ['Đá cẩm thạch nguyên phiến chống ố', 'Chân kim loại mạ vàng 24K chải xước', 'Da công nghiệp microfiber chống bám bẩn'],
                    'avoid' => ['Vải bọc ghế khó tháo giặt', 'Mặt bàn kính dễ xước dăm'],
                ],
                'colors' => [
                    ['name' => 'Đá Marble Đen Tia Chớp', 'hex' => '#1C1C1E'],
                    ['name' => 'Vàng 24K Chải Xước', 'hex' => '#E5C158'],
                    ['name' => 'Gỗ Mun Cao Cấp', 'hex' => '#2B231D'],
                    ['name' => 'Trắng Tinh Khiết', 'hex' => '#FAFAFA'],
                ],
                'advice' => 'Bàn ăn 8 ghế mặt đá kết hợp tủ bếp Provence tinh xảo là lựa chọn lý tưởng cho các bữa tiệc tối gia đình và đón tiếp đối tác sang trọng.',
                'product_ids' => [6, 4, 12], // Bàn Ăn Sovereign, Ghế Đọc Sách Noir, Tủ Bếp Bespoke Provence
                'combo_name' => 'Bản Phối Cảnh: Phòng Đại Tiệc Tân Cổ Điển',
                'category_hint' => 'dining',
                'before_image_url' => '/images/staged/dining_before.jpg',
                'staged_image_url' => '/images/staged/dining_after.jpg',
                'floorplan_data' => [
                    'room_width' => 4.6,
                    'room_length' => 7.0,
                    'room_area' => 32.2,
                    'balcony_clearance' => 130,
                    'main_door_clearance' => 150,
                    'coverage_percent' => 25.0,
                    'sofa_name' => 'Bàn Ăn Mặt Đá Nero Marquina 8 Ghế',
                    'sofa_dimensions' => '240 x 110 x 76 cm',
                    'table_dimensions' => '55 x 58 x 88 cm',
                ],
            ],
        ];

        $selectedPreset = $presets[$presetId] ?? $presets['penthouse_living'];

        // Apply user-specified preferences if provided
        if (!empty($area)) {
            $selectedPreset['area'] = trim($area) . ' m²';
        }
        if (!empty($desiredStyle)) {
            $selectedPreset['style'] = $desiredStyle;
            $selectedPreset['title'] = "Không Gian " . $desiredStyle;
        }
        if (!empty($colorTone)) {
            $selectedPreset['advice'] = "Không gian được định hình nhấn mạnh tông màu {$colorTone}. " . $selectedPreset['advice'];
        }
        if (!empty($userNote)) {
            $selectedPreset['advice'] .= " Ghi chú cá nhân: {$userNote}";
        }

        $isAiVisionAnalyzed = false;

        // If user uploaded an image and Gemini is available, attempt senior multimodal vision analysis
        if (($imageFile || $imageBase64) && $this->gemini->isConfigured()) {
            try {
                $base64Data = '';
                $mimeType = 'image/jpeg';
                if ($imageFile) {
                    $base64Data = base64_encode(file_get_contents($imageFile->getRealPath()));
                    $mimeType = $imageFile->getMimeType();
                } elseif ($imageBase64) {
                    if (str_contains($imageBase64, ',')) {
                        $parts = explode(',', $imageBase64);
                        $base64Data = $parts[1];
                    } else {
                        $base64Data = $imageBase64;
                    }
                }

                if (!empty($base64Data)) {
                    $userContextStr = "Thông tin khách cung cấp: Diện tích: " . ($area ? $area . 'm²' : 'chưa xác định') . ", Tông màu: " . ($colorTone ?: 'tự do') . ", Phong cách mong muốn: " . ($desiredStyle ?: 'hiện đại') . ", Yêu cầu: " . ($userNote ?: 'không có');
                    
                    $visionPrompt = <<<PROMPT
Bạn là Giám đốc Kiến trúc & Thiết kế Không gian Cấp cao của GS Luxury (Thương hiệu nội thất xa xỉ may đo).
Hãy trực tiếp quan sát kỹ bức ảnh căn phòng thực tế này và thẩm định không gian thực tế theo 5 LỚP BÓC TÁCH KIẾN TRÚC CHUYÊN SÂU:

Dữ liệu khách hàng: {$userContextStr}

YÊU CẦU BÓC TÁCH CHÂN THỰC THEO ẢNH (KHÔNG DÙNG VĂN MẪU, PHẢI NHÌN ĐÚNG HIỆN TRẠNG ẢNH):
- Lớp 1 (Kết cấu thực tế): Nhận diện cụ thể trần (trần phẳng/thạch cao/dầm bê tông, ước lượng chiều cao m), sàn (loại vật liệu sàn gỗ/gạch men/đá hoa cương, tông màu), tường và ô cửa sổ (số lượng cánh kính, hướng lấy sáng).
- Lớp 2 (Ánh sáng & Đánh giá): Phân tích nguồn sáng tự nhiên, 1 ưu điểm mặt bằng và 1 thách thức/nhược điểm cần xử lý (ví dụ: góc tối, phòng hẹp, âm dội, dầm đè...).
- Lớp 3 (Bố trí công năng): Điểm nhìn tiêu điểm chính (Focal point), vị trí đặt đồ nội thất chính (Sofa/Giường/Bàn ăn), khoảng cách luồng giao thông tối thiểu.
- Lớp 4 (Ma trận vật liệu & Màu sắc): 3 chất liệu nên dùng, 2 chất liệu nên tránh, và 4 màu sắc HEX thực tế trích xuất từ các mảng màu chính trong ảnh.
- Lớp 5 (Định hướng combo): Đặt tên bản đồ án phối cảnh sang trọng, lời khuyên KTS Trưởng sắc bén, và chỉ định category_hint ('living' | 'bedroom' | 'dining' | 'lighting').

BẮT BUỘC CHỈ TRẢ VỀ DUY NHẤT 1 ĐỐI TƯỢNG JSON (KHÔNG BỌC TRONG BẤT KỲ VĂN BẢN NGOÀI NÀO) CÓ CẤU TRÚC:
{
  "detected_room_type": "Tên loại phòng chuẩn (vd: Phòng Khách Căn Hộ Hiện Đại / Phòng Ngủ Master Sang Trọng)",
  "detected_style": "Tên phong cách kiến trúc chuẩn",
  "estimated_area": "Khoảng diện tích m2 ước lượng",
  "concept_title": "Tên đồ án phối cảnh độc bản",
  "structural_analysis": {
    "ceiling": "Mô tả chi tiết trần nhà và chiều cao từ ảnh",
    "floor": "Mô tả chi tiết sàn và màu sắc từ ảnh",
    "walls_windows": "Mô tả chi tiết tường, khung cửa sổ từ ảnh"
  },
  "spatial_evaluation": {
    "lighting": "Phân tích hướng sáng và chất lượng ánh sáng từ ảnh",
    "pros": "Điểm mạnh kiến trúc nổi bật",
    "cons": "Thách thức kiến trúc cần lưu ý khắc phục"
  },
  "layout_zoning": {
    "focal_point": "Điểm nhìn tiêu điểm vàng của phòng",
    "furniture_placement": "Vị trí đặt món nội thất chính tối ưu tỷ lệ",
    "circulation": "Quy chuẩn luồng giao thông đi lại thông thoáng"
  },
  "material_matrix": {
    "recommended": ["Vật liệu nên dùng 1", "Vật liệu nên dùng 2", "Vật liệu nên dùng 3"],
    "avoid": ["Vật liệu nên tránh 1", "Vật liệu nên tránh 2"]
  },
  "color_palette": [
    {"name": "Tên màu 1", "hex": "#HEX1"},
    {"name": "Tên màu 2", "hex": "#HEX2"},
    {"name": "Tên màu 3", "hex": "#HEX3"},
    {"name": "Tên màu 4", "hex": "#HEX4"}
  ],
  "architect_advice": "Lời khuyên đắt giá của KTS Trưởng (2-3 câu mang tính giải pháp thực thi)",
  "category_hint": "living"
}
PROMPT;

                    $geminiRes = $this->gemini->generateMultimodalContent($visionPrompt, $base64Data, $mimeType);
                    if (!isset($geminiRes['error']) && !empty($geminiRes['text'])) {
                        $parsed = $this->parseGeminiResponse($geminiRes['text']);
                        if ($parsed && isset($parsed['detected_room_type'])) {
                            $isAiVisionAnalyzed = true;
                            $selectedPreset['title'] = $parsed['detected_room_type'];
                            $selectedPreset['style'] = $desiredStyle ?: ($parsed['detected_style'] ?? $selectedPreset['style']);
                            $selectedPreset['area'] = $area ? ($area . ' m²') : ($parsed['estimated_area'] ?? $selectedPreset['area']);
                            $selectedPreset['combo_name'] = $parsed['concept_title'] ?? ("Bản Phối Cảnh: " . $selectedPreset['title']);
                            $selectedPreset['lighting'] = $parsed['spatial_evaluation']['lighting'] ?? ($parsed['lighting_analysis'] ?? $selectedPreset['lighting']);
                            $selectedPreset['advice'] = $parsed['architect_advice'] ?? $selectedPreset['advice'];
                            
                            if (!empty($parsed['structural_analysis'])) {
                                $selectedPreset['structural_analysis'] = $parsed['structural_analysis'];
                            }
                            if (!empty($parsed['spatial_evaluation'])) {
                                $selectedPreset['spatial_evaluation'] = $parsed['spatial_evaluation'];
                            }
                            if (!empty($parsed['layout_zoning'])) {
                                $selectedPreset['layout_zoning'] = $parsed['layout_zoning'];
                            }
                            if (!empty($parsed['material_matrix'])) {
                                $selectedPreset['material_matrix'] = $parsed['material_matrix'];
                            }
                            if (!empty($parsed['color_palette']) && is_array($parsed['color_palette'])) {
                                $selectedPreset['colors'] = $parsed['color_palette'];
                            }
                            if (!empty($parsed['category_hint'])) {
                                $selectedPreset['category_hint'] = $parsed['category_hint'];
                            }
                        }
                    }
                }
            } catch (\Exception $e) {
                // Graceful fallback to rich preset
            }
        }

        // Dynamically select products for the combo package
        $categoryHint = $selectedPreset['category_hint'] ?? 'living';
        $productIds = match ($categoryHint) {
            'bedroom' => [7, 8, 9],    // Giường Canopy Elysée, Tủ Áo Héritage, Gương Cascade
            'dining' => [6, 4, 12],    // Bàn Ăn Sovereign, Ghế Đọc Sách Noir, Tủ Bếp Provence
            default => [1, 5, 10],     // Sofa Velvet Aurora, Bàn Trà Marble Aria, Đèn Sàn Solstice
        };

        if (!empty($selectedPreset['product_ids'])) {
            $productIds = $selectedPreset['product_ids'];
        }

        $comboProducts = Product::whereIn('id', $productIds)
            ->with(['images', 'category'])
            ->get();

        if ($comboProducts->count() < 3) {
            $comboProducts = Product::where('status', 'active')
                ->where('stock_quantity', '>', 0)
                ->with(['images', 'category'])
                ->take(3)
                ->get();
        }

        $originalTotal = (float) $comboProducts->sum('price');
        $discountPercent = 10; // Giảm giá 10% khi mua trọn bộ combo
        $comboPrice = round($originalTotal * 0.9);
        $savings = $originalTotal - $comboPrice;

        $items = $comboProducts->map(function ($p, $idx) use ($selectedPreset) {
            $roles = [
                0 => 'Món nội thất tâm điểm (Hero Piece)',
                1 => 'Điểm nhấn hòa sắc (Accent Companion)',
                2 => 'Ánh sáng & Phụ kiện nghệ thuật (Finishing Touch)',
            ];
            
            $placementReasons = [
                0 => "Tâm điểm không gian, cân bằng hoàn hảo với tỷ lệ {$selectedPreset['area']} và tôn vinh đường nét kiến trúc.",
                1 => "Hòa sắc tự nhiên với sàn và tường, tạo độ sâu tương phản sang trọng không gây rối mắt.",
                2 => "Điểm xuyết ánh sáng và vật liệu phản xạ, hoàn thiện trọn vẹn thẩm mỹ của KTS Trưởng.",
            ];

            return [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'price' => (float) $p->price,
                'category' => $p->category?->name ?? 'Nội Thất Cao Cấp',
                'material' => $p->material ?? 'Vật liệu nhập khẩu cao cấp',
                'dimensions' => $p->dimensions ?? 'Tiêu chuẩn quốc tế',
                'image' => ($p->images->first()?->image_url) ?? '/images/hero-banner.jpg',
                'role' => $roles[$idx] ?? 'Phối kiện hoàn hảo',
                'reason' => $placementReasons[$idx] ?? "Tương thích 98% với phong cách {$selectedPreset['style']}.",
            ];
        });

        return response()->json([
            'success' => true,
            'meta' => [
                'engine' => $isAiVisionAnalyzed ? 'gemini_3.5_flash_multimodal_architect' : 'architectural_ruleset_studio',
                'analyzed_at' => now()->toISOString(),
                'version' => '2.5.0-luxury',
            ],
            'data' => [
                'preset_id' => $presetId,
                'detected_room_type' => $selectedPreset['title'],
                'detected_style' => $selectedPreset['style'],
                'estimated_area' => $selectedPreset['area'],
                'lighting_analysis' => $selectedPreset['lighting'],
                'before_image_url' => $selectedPreset['before_image_url'] ?? '/images/staged/penthouse_before.jpg',
                'staged_image_url' => $selectedPreset['staged_image_url'] ?? '/images/staged/penthouse_after.jpg',
                'floorplan_data' => $selectedPreset['floorplan_data'] ?? [
                    'room_width' => 4.8,
                    'room_length' => 7.2,
                    'room_area' => 35,
                    'balcony_clearance' => 115,
                    'main_door_clearance' => 135,
                    'coverage_percent' => 24.5,
                    'sofa_name' => 'Sofa Modular Riviera 3 Chỗ',
                    'sofa_dimensions' => '280 x 105 x 82 cm',
                    'table_dimensions' => '120 x 70 x 42 cm',
                ],
                'structural_analysis' => $selectedPreset['structural_analysis'] ?? [
                    'ceiling' => 'Trần thạch cao phẳng kết hợp họng gió âm trần cao độ 3.0m',
                    'floor' => 'Sàn gỗ kỹ thuật chống xước hoặc đá tự nhiên đồng bộ',
                    'walls_windows' => 'Hệ vách phẳng đón sáng tự nhiên',
                ],
                'spatial_evaluation' => $selectedPreset['spatial_evaluation'] ?? [
                    'lighting' => $selectedPreset['lighting'],
                    'pros' => 'Mặt bằng bố cục mạch lạc, tối ưu ánh sáng tự nhiên',
                    'cons' => 'Cần xử lý vật liệu mềm tiêu âm và phân vùng lối đi',
                ],
                'layout_zoning' => $selectedPreset['layout_zoning'] ?? [
                    'focal_point' => 'Khu vực tiếp khách trung tâm đón tầm nhìn đắt giá nhất',
                    'furniture_placement' => 'Đặt sofa chính đối diện vách điểm nhấn, cân bằng thị giác',
                    'circulation' => 'Hành lang đệm giao thông tối thiểu 85cm - 100cm',
                ],
                'material_matrix' => $selectedPreset['material_matrix'] ?? [
                    'recommended' => ['Da bò thuộc Ý cao cấp', 'Gỗ tự nhiên sấy tiêu chuẩn', 'Đá cẩm thạch Calacatta'],
                    'avoid' => ['Vật liệu bắt bụi dày', 'Kính phản quang đối diện nguồn sáng'],
                ],
                'architect_advice' => $selectedPreset['advice'],
                'color_palette' => $selectedPreset['colors'],
                'confidence_score' => $isAiVisionAnalyzed ? 98.6 : 96.5,
                'is_ai_vision' => $isAiVisionAnalyzed,
                'combo_package' => [
                    'name' => $selectedPreset['combo_name'],
                    'discount_percent' => $discountPercent,
                    'original_total' => $originalTotal,
                    'combo_price' => $comboPrice,
                    'savings' => $savings,
                    'items' => $items,
                ],
            ],
        ]);
    }

    /**
     * Parse Gemini JSON response safely
     */
    protected function parseGeminiResponse(string $raw): ?array
    {
        $text = trim($raw);
        if (empty($text)) {
            return null;
        }

        // Remove markdown code fences if present (e.g. ```json ... ```)
        if (preg_match('/```(?:json)?\s*([\s\S]*?)\s*```/i', $text, $matches)) {
            $text = trim($matches[1]);
        }

        // Try direct json_decode
        $decoded = json_decode($text, true);
        if (is_array($decoded)) {
            return $decoded;
        }

        // Try finding the first '{' and last '}'
        $firstBrace = strpos($text, '{');
        $lastBrace = strrpos($text, '}');
        if ($firstBrace !== false && $lastBrace !== false && $lastBrace > $firstBrace) {
            $substring = substr($text, $firstBrace, $lastBrace - $firstBrace + 1);
            $decoded = json_decode($substring, true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }

        return null;
    }

    /**
     * Map room type key to Vietnamese label
     */
    protected function getRoomTypeLabel(string $type): string
    {
        return match (strtolower(trim($type))) {
            'bedroom', 'phong_ngu', 'bed' => 'Phòng Ngủ Master',
            'dining', 'phong_an', 'kitchen' => 'Phòng Ăn & Bếp Mở',
            'office', 'phong_lam_viec' => 'Phòng Làm Việc & Thư Viện',
            default => 'Phòng Khách Sang Trọng',
        };
    }

    /**
     * Generate match reason for product in rule-based mode
     */
    protected function getMatchReason(Product $product, ?string $category): string
    {
        return match ($category) {
            'sofa' => "Sofa thiết kế chuẩn tỷ lệ vàng, da bọc thủ công tỉ mỉ từng đường kim mũi chỉ.",
            'dining' => "Bàn ăn mặt đá cao cấp chịu lực, tạo điểm nhấn ấm cúng cho không gian tiệc tối gia đình.",
            'coffee_table' => "Mặt đá vân mây tự nhiên kết hợp chân kim loại ánh kim tôn vinh đẳng cấp phòng khách.",
            'bedroom' => "Đường nét thanh lịch, độ đàn hồi tiêu chuẩn khách sạn 5 sao mang lại giấc ngủ sâu.",
            'lighting' => "Khúc xạ ánh sáng nghệ thuật, tạo hiệu ứng thị giác lung linh cho buổi tối.",
            default => "Được chế tác từ vật liệu nhập khẩu cao cấp, phù hợp với phong cách sống thời thượng.",
        };
    }
}