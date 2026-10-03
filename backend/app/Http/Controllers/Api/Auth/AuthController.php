<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    // Đăng ký tài khoản
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
            'password' => ['required', 'confirmed', Password::min(6)],
        ], [
            'name.required' => 'Vui lòng nhập họ và tên.',
            'email.required' => 'Vui lòng nhập email.',
            'email.email' => 'Email không đúng định dạng.',
            'email.unique' => 'Email này đã được sử dụng.',
            'password.required' => 'Vui lòng nhập mật khẩu.',
            'password.confirmed' => 'Mật khẩu xác nhận không trùng khớp.',
            'password.min' => 'Mật khẩu phải có tối thiểu 6 ký tự.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'role' => 'customer',
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('gs-luxury-auth')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Đăng ký tài khoản thành công.',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ], 201);
    }

    // Đăng nhập
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ], [
            'email.required' => 'Vui lòng nhập email.',
            'password.required' => 'Vui lòng nhập mật khẩu.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng điền đầy đủ thông tin đăng nhập.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email hoặc mật khẩu không chính xác.',
            ], 401);
        }

        // Revoke previous tokens
        $user->tokens()->delete();

        $token = $user->createToken('gs-luxury-auth')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Đăng nhập thành công.',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ]);
    }

    // Lấy thông tin tài khoản hiện tại
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $request->user(),
            ],
        ]);
    }

    // Cập nhật thông tin cá nhân
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user->update($request->only(['name', 'phone', 'address', 'avatar']));

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin thành công.',
            'data' => [
                'user' => $user->fresh(),
            ],
        ]);
    }

    // Đăng xuất
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đăng xuất thành công.',
        ]);
    }

    // Quên mật khẩu: Gửi email đặt lại mật khẩu
    public function forgotPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
        ], [
            'email.required' => 'Vui lòng nhập địa chỉ email.',
            'email.email' => 'Địa chỉ email không đúng định dạng.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy tài khoản tương ứng với email này.',
            ], 404);
        }

        // Tạo mã OTP đặt lại mật khẩu 6 chữ số
        $otp = (string) rand(100000, 999999);
        \Illuminate\Support\Facades\Cache::put('password_reset_' . $user->email, $otp, 900); // 15 phút

        try {
            \Illuminate\Support\Facades\Mail::raw(
                "Xin chào {$user->name},\n\nMã xác nhận đặt lại mật khẩu tài khoản GS Luxury của quý khách là: {$otp}\n\nMã có hiệu lực trong vòng 15 phút. Nếu quý khách không thực hiện yêu cầu này, vui lòng bỏ qua email.\n\nTrân trọng,\nĐội ngũ CSKH GS Luxury\nHotline: 1900 8888",
                function ($message) use ($user) {
                    $message->to($user->email)
                        ->subject('Mã xác nhận khôi phục mật khẩu - GS Luxury');
                }
            );
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('Failed to send forgot password email: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Hệ thống đã gửi mã xác nhận khôi phục mật khẩu đến email ' . $user->email . '. Vui lòng kiểm tra hộp thư (bao gồm cả thư rác/spam).',
        ]);
    }

    // Đặt lại mật khẩu mới bằng OTP
    public function resetPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'token' => ['nullable', 'string'],
            'password' => ['required', 'confirmed', Password::min(6)],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản không tồn tại.',
            ], 404);
        }

        $cachedOtp = \Illuminate\Support\Facades\Cache::get('password_reset_' . $user->email);
        if ($request->filled('token') && $cachedOtp && $request->token !== $cachedOtp) {
            return response()->json([
                'success' => false,
                'message' => 'Mã xác nhận không chính xác hoặc đã hết hạn.',
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        \Illuminate\Support\Facades\Cache::forget('password_reset_' . $user->email);

        return response()->json([
            'success' => true,
            'message' => 'Mật khẩu đã được đặt lại thành công. Quý khách có thể đăng nhập ngay.',
        ]);
    }
}
