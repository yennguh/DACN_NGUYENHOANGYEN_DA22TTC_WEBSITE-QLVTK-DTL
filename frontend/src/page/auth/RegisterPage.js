import React from "react";
import { Link, useNavigate } from "react-router-dom";
import background from "../../public/assets/bg.jpg";
import logo from "../../public/assets/logo.jpg";
import { useForm } from "react-hook-form";
import { fetchRegisterAPI } from "../../api/users.api";
const RegisterPage = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm({ mode: "onTouched" });

    const onSubmit = async (data) => {
        let payload = {
            email: data.email,
            password: data.password,
            fullname: data.fullname,
            phone: data.phone,
            roles: ['user']
        }
        try {

            const res = await fetchRegisterAPI(payload);
            if (res) {
                navigate("/login");
            }
        } catch (error) {
        }

    };

    return (
        <div
            className="min-h-screen bg-cover bg-center flex items-center justify-center relative"
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

                    <p className="text-sm mt-1">Tạo tài khoản mới</p>
                </div>

                {/* Form đăng ký */}
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8 space-y-5 mb-5">
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Họ và tên
                        </label>
                        <input
                            {...register("fullname", {
                                required: "Họ tên là bắt buộc",
                            })}
                            type="text"
                            placeholder="Nguyễn Văn A"
                            className="mt-1 w-full p-3 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.fullname.message}</p>
                        )}
                    </div>

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
                            type="email"
                            placeholder="email@example.com"
                            className="mt-1 w-full p-3 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Số điện thoại
                        </label>
                        <input
                            {...register("phone", {
                                required: "Số điện thoại là bắt buộc",
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message: "Số điện thoại không hợp lệ",
                                },
                            })}
                            type="tel"
                            placeholder="0962********"
                            className="mt-1 w-full p-3 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
                        <input
                            {...register("password", { required: "Mật khẩu là bắt buộc" })}
                            type="password"
                            placeholder="••••••••"
                            className="mt-1 w-full p-3 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
                        <input
                            {...register("confirmPassword", {
                                required: "Xác nhận mật khẩu là bắt buộc",
                                validate: (value) =>
                                    value === watch("password") || "Mật khẩu không khớp",
                            })}
                            type="password"
                            placeholder="••••••••"
                            className="mt-1 w-full p-3 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                        />
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                        )}
                    </div>



                    <button type="submit" disabled={!isValid} className={`w-full bg-blue-600 text-white font-semibold py-3 rounded-full transition ${!isValid ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}`}>
                        Đăng ký
                    </button>

                    <div className="text-center text-sm text-gray-600">
                        Đã có tài khoản?{" "}
                        <Link to="/login" className="text-red-600 hover:underline font-medium">
                            Đăng nhập
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;