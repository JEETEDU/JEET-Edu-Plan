import Link from "next/link";

export function Navigation1() {
    return (
        <div className="w-full fixed bg-gray-100 dark:bg-gray-900">
            {/* 상단 로고 */}
            <header className="w-full p-4 flex items-center justify-start bg-gray-100 dark:bg-gray-800">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    JEET Education
                </div>
            </header>
        </div>
    );
}

export function Navigation2() {
    return (
        <div className="w-full flex flex-col bg-gray-100 dark:bg-gray-900">
            {/* 네비게이션 링크 (하단 고정) */}
            <nav className="fixed bottom-0 left-0 w-full bg-gray-100 dark:bg-gray-800 flex justify-around py-3 border-t border-gray-300 dark:border-gray-700">
                <Link href="/home" className="nav-item flex flex-col items-center text-gray-700 dark:text-gray-300 hover:text-blue-500">
                    <span>Home</span>
                </Link>
                <Link href="/" className="nav-item flex flex-col items-center text-gray-700 dark:text-gray-300 hover:text-blue-500">
                    <span>Classroom</span>
                </Link>
                <Link href="/" className="nav-item flex flex-col items-center text-gray-700 dark:text-gray-300 hover:text-blue-500">
                    <span>Time table</span>
                </Link>
                <Link href="/" className="nav-item flex flex-col items-center text-gray-700 dark:text-gray-300 hover:text-blue-500">
                    <span>MyPage</span>
                </Link>
            </nav>
        </div>
    );
}