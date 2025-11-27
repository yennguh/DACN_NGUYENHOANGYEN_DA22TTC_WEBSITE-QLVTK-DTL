import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import background from "../../public/assets/bg.jpg";
import logo from "../../public/assets/logo.jpg";
import { EyeOff, Eye } from "lucide-react";
import { useForm } from "react-hook-form";
import { fetchLoginAPI } from "../../api/users.api";
import Cookies from 'js-cookie';
import { AuthContext } from "../../core/AuthContext";
import { jwtDecode } from "jwt-decode";

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext); // Dùng context để cập nhật token
    const [passwordVisible, setPasswordVisible] = useState(false);
    const togglePassword = () => setPasswordVisible(v => !v);

    const onSubmit = async (data) => {
        const payload = {
            email: data.email,
            password: data.password
        };

        try {
            const res = await fetchLoginAPI(payload);

            // Lấy token từ nhiều khả năng trả về
            const accessToken = res?.accessToken || res?.access_token || res?.data?.accessToken || res?.data?.access_token;
            const refreshToken = res?.refreshToken || res?.refresh_token || res?.data?.refreshToken || res?.data?.refresh_token;

            if (accessToken) {
                // 1. Cập nhật AuthContext
                login(accessToken, refreshToken);

                // 2. Lưu vào Cookies (nếu backend yêu cầu)
                Cookies.set("accessToken", accessToken, { expires: 7 });
                if (refreshToken) Cookies.set("refreshToken", refreshToken, { expires: 30 });

                // 3. Lưu vào localStorage (để Header dùng)
                localStorage.setItem("token", accessToken);

                // 4. Giải mã token để lấy role
                let userRole = null;
                try {
                    const decoded = jwtDecode(accessToken);
                    userRole = decoded.roles || decoded.role || null;
                } catch (err) {
                    console.warn("Không thể giải mã token:", err);
                }

                // 5. Chuyển hướng theo role
                if (userRole && (Array.isArray(userRole) ? userRole.includes("admin") : userRole === "admin")) {
                    navigate('/admin');
                    return;
                }

                // Người dùng thường → trang chủ
                navigate('/');
                return;
            }

            // Xử lý trường hợp không có token nhưng API trả success
            if (res && (res.success === true || res.status === 'ok')) {
                alert("Đăng nhập thành công nhưng không có token!");
                navigate('/');
                return;
            }

            // Lỗi từ server
            const msg = res?.message || 'Tài khoản hoặc mật khẩu không đúng!';
            alert(msg);

        } catch (error) {
            console.error('Login error:', error?.response ?? error);
            const errMsg = error?.response?.data?.message || error?.message || 'Lỗi khi đăng nhập';
            alert(errMsg);
        }
    };

    const { register, handleSubmit, formState: { errors } } = useForm({ mode: "onTouched" });

    return (
        <div
            className="min-h-screen bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: `url(${background})` }}
        >
            <div className="bg-black bg-opacity-50 absolute inset-0"></div>

            <div className="relative z-10 flex flex-col items-center w-full">
                {/* Logo + tiêu đề */}
                <div className="text-center text-white mb-8">
                    <img src={logo} alt="logo" className="mx-auto w-24 h-24 mb-3" />
                    <h2 className="text-xl font-semibold uppercase">
                        Đại học Trà Vinh
                    </h2>

                    <h1 className="text-2xl font-bold mt-3">Đăng nhập</h1>
                    <p className="text-sm mt-1">Đăng nhập vào tài khoản của bạn</p>
                </div>

                {/* Form đăng nhập */}
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8 space-y-5">
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Email 
                        </label>
                        <input
                            {...register("email", {
                                required: "Email là bắt buộc",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Email không hợp lệ",
                                },
                            })}
                            type="text"
                            placeholder="admin@admin.com"
                            className="mt-1 w-full p-3 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
                        <div className="relative mt-1">
                            <input
                                {...register("password", { required: "Mật khẩu là bắt buộc" })}
                                type={passwordVisible ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full pr-12 p-3 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                                aria-label="Mật khẩu"
                            />

                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                            )}
                            {/* nút hiển thị/mờ mật khẩu */}
                            <button
                                type="button"
                                onClick={togglePassword}
                                aria-label={passwordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                className="absolute inset-y-0 right-2 flex items-center px-2"
                                tabIndex={0}
                            >
                                {passwordVisible ? <Eye /> : <EyeOff />}
                            </button>
                        </div>
                        <div className="flex justify-end text-sm mt-1">
                            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                            <a href="#" className="text-red-600 hover:underline">
                                Quên mật khẩu?
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input id="remember" type="checkbox" className="w-4 h-4" />
                        <label htmlFor="remember" className="text-sm text-gray-700">
                            Lưu đăng nhập
                        </label>
                    </div>

                    <button className="w-full bg-blue-600 text-white font-semibold py-3 rounded-full hover:bg-blue-700 transition">
                        Đăng nhập
                    </button>

                    <div className="text-center text-sm text-gray-600">
                        Bạn chưa có tài khoản?{" "}
                        <Link to="/register" className="text-red-600 hover:underline font-medium">
                            Đăng ký
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;