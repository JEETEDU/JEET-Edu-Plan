import Link from "next/link";

export default function Navigation() {
    return (
        <div className='fixed'>
            <nav className="min-w-screen bg-gray-100 dark:bg-gray-800 flex items-center justify-between px-6 py-4">
                {/* 로고 자리 */}
                <div className="flex items-center space-x-4">
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        JEET Education
                    </div>
                </div>
                {/* 네비게이션 링크 */}
                <div className="flex space-x-6">
                    <Link href={"/home"} className="nav-item">
                        Home
                    </Link>
                    <Link href={"/"} className="nav-item">
                        Classroom
                    </Link>
                    <Link href={"/"} className="nav-item">
                        Time table
                    </Link>
                    <Link href={"/"} className="nav-item">
                        MyPage
                    </Link>
                </div>
            </nav>
        </div>
    );
}
