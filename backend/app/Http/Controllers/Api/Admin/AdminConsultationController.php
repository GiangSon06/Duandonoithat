<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminConsultationController extends Controller
{
    /**
     * Danh sách tất cả yêu cầu tư vấn / thiết kế nội thất
     */
    public function index(Request $request): JsonResponse
    {
        // Auto-seed initial demo consultation leads if table is empty
        if (Consultation::count() === 0) {
            $demoLeads = [
                [
                    'full_name' => 'Bà Trần Thu Hương',
                    'phone' => '0912345678',
                    'email' => 'huong.tran@gmail.com',
                    'address' => 'Penthouse P2-2804, Vinhomes Metropolis, Ba Đình, Hà Nội',
                    'preferred_date' => now()->addDays(2)->toDateString(),
                    'space_type' => 'Penthouse Thông Tầng',
                    'budget_range' => '500 triệu - 1 tỷ',
                    'message' => 'Cần tư vấn trọn gói bộ sofa da Ý phòng khách và bàn ăn 10 ghế đá tự nhiên đón tân gia.',
                    'status' => 'new',
                ],
                [
                    'full_name' => 'Ông Nguyễn Đức Long',
                    'phone' => '0987654321',
                    'email' => 'long.nguyen@vietin.vn',
                    'address' => 'Biệt thự Đơn Lập Hoa Sữa 08-12, Vinhomes Riverside, Long Biên',
                    'preferred_date' => now()->addDays(4)->toDateString(),
                    'space_type' => 'Biệt Thự Đơn Lập',
                    'budget_range' => 'Trên 1 tỷ',
                    'message' => 'Muốn đặt may đo toàn bộ nội thất gỗ óc chó Bắc Mỹ cho phòng khách và 3 phòng ngủ master.',
                    'status' => 'contacted',
                ],
                [
                    'full_name' => 'Chị Lê Mai Phương',
                    'phone' => '0933445566',
                    'email' => 'maiphuong.design@gmail.com',
                    'address' => 'Căn hộ Duplex D15, Masteri Thảo Điền, TP. Thủ Đức, TP.HCM',
                    'preferred_date' => now()->addDays(1)->toDateString(),
                    'space_type' => 'Căn Hộ Cao Cấp',
                    'budget_range' => '200 - 500 triệu',
                    'message' => 'Cần kiến trúc sư qua khảo sát thực địa để đo đạc và tư vấn hệ tủ rượu âm tường.',
                    'status' => 'new',
                ],
            ];

            foreach ($demoLeads as $lead) {
                Consultation::create($lead);
            }
        }

        $query = Consultation::query()->latest();

        // Filter by status
        if ($request->has('status') && $request->status !== 'all' && !empty($request->status)) {
            $query->where('status', $request->status);
        }

        // Search by keyword
        if ($request->has('search') && !empty($request->search)) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        $perPage = (int) $request->input('per_page', 20);
        $consultations = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $consultations->items(),
            'meta' => [
                'current_page' => $consultations->currentPage(),
                'last_page' => $consultations->lastPage(),
                'per_page' => $consultations->perPage(),
                'total' => $consultations->total(),
            ],
            'stats' => [
                'total' => Consultation::count(),
                'new' => Consultation::where('status', 'new')->count(),
                'contacted' => Consultation::where('status', 'contacted')->count(),
                'scheduled' => Consultation::where('status', 'scheduled')->count(),
                'completed' => Consultation::where('status', 'completed')->count(),
            ],
        ]);
    }

    /**
     * Cập nhật trạng thái xử lý yêu cầu tư vấn
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:new,contacted,scheduled,completed,cancelled',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $consultation = Consultation::findOrFail($id);
        $consultation->status = $request->status;
        $consultation->save();

        $labels = [
            'new' => 'Mới tiếp nhận',
            'contacted' => 'Đã liên hệ',
            'scheduled' => 'Đã hẹn lịch khảo sát',
            'completed' => 'Đã tư vấn thành công',
            'cancelled' => 'Đã hủy',
        ];

        return response()->json([
            'success' => true,
            'message' => "Đã chuyển trạng thái yêu cầu sang '{$labels[$request->status]}'.",
            'data' => $consultation,
        ]);
    }

    /**
     * Xóa yêu cầu tư vấn
     */
    public function destroy($id): JsonResponse
    {
        $consultation = Consultation::findOrFail($id);
        $consultation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa yêu cầu tư vấn khỏi hệ thống.',
        ]);
    }
}
