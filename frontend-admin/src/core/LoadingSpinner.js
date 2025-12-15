import React from 'react';

// Loading Spinner đơn giản
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
        xl: 'w-16 h-16 border-4'
    };

    return (
        <div className={`${sizeClasses[size]} border-blue-500 border-t-transparent rounded-full animate-spin ${className}`}></div>
    );
};

// Loading toàn trang
export const PageLoading = ({ message = 'Đang tải...' }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
            <LoadingSpinner size="xl" />
            <p className="mt-4 text-gray-500 text-lg">{message}</p>
        </div>
    );
};

// Skeleton cho card bài đăng
export const PostCardSkeleton = () => {
    return (
        <div className="w-full bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100 animate-pulse">
            {/* Category Badge */}
            <div className="h-10 bg-gray-200"></div>
            
            {/* User info */}
            <div className="flex items-center gap-4 p-5">
                <div className="w-14 h-14 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
            </div>
            
            {/* Title */}
            <div className="px-5 pb-4">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
            
            {/* Image placeholder */}
            <div className="w-full h-80 bg-gray-200"></div>
            
            {/* Meta info */}
            <div className="px-5 py-4 bg-gray-50 flex items-center gap-6">
                <div className="h-8 bg-gray-200 rounded-full w-24"></div>
                <div className="h-8 bg-gray-200 rounded-full w-24"></div>
            </div>
            
            {/* Actions */}
            <div className="flex justify-between items-center px-5 py-4 border-t border-gray-100">
                <div className="h-10 bg-gray-200 rounded-full w-32"></div>
                <div className="h-10 bg-gray-200 rounded-full w-32"></div>
            </div>
        </div>
    );
};

// Skeleton cho danh sách bài đăng
export const PostListSkeleton = ({ count = 3 }) => {
    return (
        <div className="flex flex-col gap-8">
            {Array.from({ length: count }).map((_, index) => (
                <PostCardSkeleton key={index} />
            ))}
        </div>
    );
};

// Skeleton cho table row
export const TableRowSkeleton = ({ columns = 6 }) => {
    return (
        <tr className="animate-pulse">
            {Array.from({ length: columns }).map((_, index) => (
                <td key={index} className="py-4 px-5">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                </td>
            ))}
        </tr>
    );
};

// Skeleton cho table
export const TableSkeleton = ({ rows = 5, columns = 6 }) => {
    return (
        <tbody>
            {Array.from({ length: rows }).map((_, index) => (
                <TableRowSkeleton key={index} columns={columns} />
            ))}
        </tbody>
    );
};

// Skeleton cho profile card
export const ProfileSkeleton = () => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
            <div className="bg-gray-200 h-24"></div>
            <div className="px-8 pb-8">
                <div className="flex items-center gap-5 -mt-12 mb-8">
                    <div className="w-28 h-28 rounded-2xl bg-gray-300 border-4 border-white"></div>
                    <div className="mt-8">
                        <div className="h-6 bg-gray-200 rounded w-40 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                </div>
                <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i}>
                            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                            <div className="h-12 bg-gray-100 rounded-xl"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Skeleton cho notification item
export const NotificationSkeleton = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
            </div>
        </div>
    );
};

// Skeleton cho danh sách notifications
export const NotificationListSkeleton = ({ count = 5 }) => {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, index) => (
                <NotificationSkeleton key={index} />
            ))}
        </div>
    );
};

// Skeleton cho Top Posters card
export const TopPosterSkeleton = () => {
    return (
        <div className="bg-white rounded-2xl p-6 animate-pulse">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
            </div>
            <div className="h-12 bg-gray-100 rounded-lg"></div>
        </div>
    );
};

// Skeleton cho grid Top Posters
export const TopPostersGridSkeleton = ({ count = 5 }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <TopPosterSkeleton key={index} />
            ))}
        </div>
    );
};

// Skeleton cho stats cards
export const StatsCardSkeleton = () => {
    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
