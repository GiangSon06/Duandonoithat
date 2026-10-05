<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\VoucherUsage;
use App\Models\Voucher;
use App\Models\AffiliateCommission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminOrderController extends Controller
{
    /**
     * List all orders for admin with pagination & filtering
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['user', 'items.product', 'items.variant'])->latest();

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('order_status', $request->status);
        }

        if ($request->filled('payment_status') && $request->payment_status !== 'all') {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($sub) use ($q) {
                $sub->where('order_number', 'like', "%{$q}%")
                    ->orWhere('customer_name', 'like', "%{$q}%")
                    ->orWhere('customer_phone', 'like', "%{$q}%")
                    ->orWhere('customer_email', 'like', "%{$q}%");
            });
        }

        $perPageParam = $request->get('per_page', 15);

        if ($perPageParam === 'all' || (int)$perPageParam >= 9999) {
            $allOrders = $query->get()->map(function ($order) {
                $order->status = $order->order_status;
                return $order;
            });

            return response()->json([
                'success' => true,
                'data' => $allOrders,
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $allOrders->count(),
                    'total' => $allOrders->count(),
                ]
            ]);
        }

        $perPage = (int)$perPageParam > 0 ? (int)$perPageParam : 15;
        $orders = $query->paginate($perPage);

        $items = collect($orders->items())->map(function ($order) {
            $order->status = $order->order_status;
            return $order;
        });

        return response()->json([
            'success' => true,
            'data' => $items,
            'pagination' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ]
        ]);
    }

    /**
     * Show single order details
     */
    public function show($id): JsonResponse
    {
        $order = Order::with(['user', 'items.product.images', 'items.variant'])
            ->where('id', $id)
            ->orWhere('order_number', $id)
            ->firstOrFail();

        $order->status = $order->order_status;

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    /**
     * Update order status & payment
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $order = Order::with('items')->findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:pending,processing,confirmed,shipping,completed,cancelled,refunded',
            'payment_status' => 'nullable|in:pending,unpaid,paid,failed,refunded',
            'notes' => 'nullable|string',
        ]);

        $oldStatus = $order->order_status;
        $newStatus = $validated['status'];

        // Handle cancellation - restore stock
        if ($newStatus === Order::STATUS_CANCELLED && $oldStatus !== Order::STATUS_CANCELLED) {
            if (!$order->canCancel()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể hủy đơn hàng ở trạng thái hiện tại.',
                ], 422);
            }

            $reason = $validated['notes'] ?? 'Hủy bởi quản trị viên';
            if (!$order->cancel($reason)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể hủy đơn hàng. Vui lòng thử lại.',
                ], 500);
            }

            $fresh = $order->fresh(['user', 'items.product.images', 'items.variant']);
            $fresh->status = $fresh->order_status;

            return response()->json([
                'success' => true,
                'message' => 'Đã hủy đơn hàng #' . $order->order_number . ' và hoàn kho thành công!',
                'data' => $fresh,
            ]);
        }

        $order->order_status = $newStatus;
        if (!empty($validated['payment_status'])) {
            $order->payment_status = $validated['payment_status'];
        }
        if (!empty($validated['notes'])) {
            $order->notes = $order->notes . "\n" . $validated['notes'];
        }
        $order->save();

        $fresh = $order->fresh(['user', 'items.product.images', 'items.variant']);
        $fresh->status = $fresh->order_status;

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái đơn hàng #' . $order->order_number . ' thành công!',
            'data' => $fresh,
        ]);
    }

    /**
     * Update order details (customer shipping info, notes)
     */
    public function update(Request $request, $id): JsonResponse
    {
        $order = Order::with('items')->findOrFail($id);

        $validated = $request->validate([
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'customer_email' => 'nullable|email|max:255',
            'shipping_address' => 'nullable|string|max:500',
            'shipping_city' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'payment_status' => 'nullable|in:pending,unpaid,paid,failed,refunded',
            'status' => 'nullable|in:pending,processing,confirmed,shipping,completed,cancelled,refunded',
            'order_status' => 'nullable|in:pending,processing,confirmed,shipping,completed,cancelled,refunded',
        ]);

        if (isset($validated['customer_name'])) $order->customer_name = $validated['customer_name'];
        if (isset($validated['customer_phone'])) $order->customer_phone = $validated['customer_phone'];
        if (isset($validated['customer_email'])) $order->customer_email = $validated['customer_email'];
        if (isset($validated['shipping_address'])) $order->shipping_address = $validated['shipping_address'];
        if (isset($validated['shipping_city'])) $order->shipping_city = $validated['shipping_city'];
        if (isset($validated['notes'])) $order->notes = $validated['notes'];
        if (isset($validated['payment_status'])) $order->payment_status = $validated['payment_status'];
        
        $newStatus = $validated['order_status'] ?? $validated['status'] ?? null;
        if ($newStatus && $newStatus !== $order->order_status) {
            if ($newStatus === Order::STATUS_CANCELLED && $order->order_status !== Order::STATUS_CANCELLED) {
                $order->cancel($validated['notes'] ?? 'Hủy khi chỉnh sửa thông tin');
            } else {
                $order->order_status = $newStatus;
            }
        }

        $order->save();

        $fresh = $order->fresh(['user', 'items.product.images', 'items.variant']);
        $fresh->status = $fresh->order_status;

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin đơn hàng #' . $order->order_number . ' thành công!',
            'data' => $fresh,
        ]);
    }

    /**
     * Delete a single order and cascade clean up
     */
    public function destroy($id): JsonResponse
    {
        $order = Order::with('items')->findOrFail($id);
        $orderNumber = $order->order_number;

        DB::beginTransaction();
        try {
            // If order was not cancelled, restore inventory
            if ($order->order_status !== Order::STATUS_CANCELLED && $order->order_status !== Order::STATUS_REFUNDED) {
                foreach ($order->items as $item) {
                    if ($item->variant_id) {
                        ProductVariant::where('id', $item->variant_id)->increment('stock_quantity', $item->quantity);
                    } elseif ($item->product_id) {
                        Product::where('id', $item->product_id)->increment('stock_quantity', $item->quantity);
                    }
                }

                if ($order->coins_used > 0 && $order->user_id) {
                    $order->user()->increment('coins', $order->coins_used);
                }

                $voucherUsage = VoucherUsage::where('order_id', $order->id)->first();
                if ($voucherUsage) {
                    Voucher::where('id', $voucherUsage->voucher_id)->decrement('used_count');
                    $voucherUsage->delete();
                }

                AffiliateCommission::where('order_id', $order->id)->delete();
            }

            // Delete order items
            $order->items()->delete();

            // Delete order
            $order->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Đã xóa đơn hàng #{$orderNumber} thành công và hoàn trả kho.",
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa đơn hàng: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk Action on Orders (Bulk Delete or Bulk Status Change)
     */
    public function bulkAction(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_ids' => 'required|array|min:1',
            'order_ids.*' => 'required|integer',
            'action' => 'required|in:delete,update_status,update_payment',
            'status' => 'nullable|in:pending,processing,confirmed,shipping,completed,cancelled,refunded',
            'payment_status' => 'nullable|in:pending,unpaid,paid,failed,refunded',
        ]);

        $orderIds = $validated['order_ids'];
        $action = $validated['action'];

        DB::beginTransaction();
        try {
            $orders = Order::with('items')->whereIn('id', $orderIds)->get();
            $count = $orders->count();

            if ($action === 'delete') {
                foreach ($orders as $order) {
                    if ($order->order_status !== Order::STATUS_CANCELLED && $order->order_status !== Order::STATUS_REFUNDED) {
                        foreach ($order->items as $item) {
                            if ($item->variant_id) {
                                ProductVariant::where('id', $item->variant_id)->increment('stock_quantity', $item->quantity);
                            } elseif ($item->product_id) {
                                Product::where('id', $item->product_id)->increment('stock_quantity', $item->quantity);
                            }
                        }
                    }
                    $order->items()->delete();
                    $order->delete();
                }

                DB::commit();
                return response()->json([
                    'success' => true,
                    'message' => "Đã xóa thành công {$count} đơn hàng được chọn.",
                ]);
            }

            if ($action === 'update_status' && !empty($validated['status'])) {
                $newStatus = $validated['status'];
                foreach ($orders as $order) {
                    if ($newStatus === Order::STATUS_CANCELLED && $order->order_status !== Order::STATUS_CANCELLED) {
                        $order->cancel('Hủy hàng loạt bởi quản trị viên');
                    } else {
                        $order->order_status = $newStatus;
                        $order->save();
                    }
                }

                DB::commit();
                return response()->json([
                    'success' => true,
                    'message' => "Đã cập nhật trạng thái cho {$count} đơn hàng thành công.",
                ]);
            }

            if ($action === 'update_payment' && !empty($validated['payment_status'])) {
                Order::whereIn('id', $orderIds)->update(['payment_status' => $validated['payment_status']]);
                DB::commit();
                return response()->json([
                    'success' => true,
                    'message' => "Đã cập nhật trạng thái thanh toán cho {$count} đơn hàng.",
                ]);
            }

            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Hành động không hợp lệ.',
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi xử lý thao tác hàng loạt: ' . $e->getMessage(),
            ], 500);
        }
    }
}