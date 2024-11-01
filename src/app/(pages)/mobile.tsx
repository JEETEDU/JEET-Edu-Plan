import {Navigation1, Navigation2} from "@/app/components/mobile/Navigation";
import Link from "next/link";

export default function Mobile() {
    return (
        <>
            <Navigation1/>
            {/* 부모 컨테이너에 Flexbox 적용 */}
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
                <div className="w-full max-w-xs bg-white dark:bg-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-center text-gray-700 dark:text-gray-200 mb-4">
                        로그인
                    </h2>
                    <form className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                                Name:
                            </label>
                            <input
                                type="text"
                                id="name"
                                className="w-full px-3 py-2 border rounded-lg border-gray-300 dark:border-gray-600 focus:(outline-none ring-2 ring-blue-400) bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                placeholder="Enter your name"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                                Password:
                            </label>
                            <input
                                type="password"
                                id="pw"
                                className="w-full px-3 py-2 border rounded-lg border-gray-300 dark:border-gray-600 focus:(outline-none ring-2 ring-blue-400) bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <div className="flex justify-center">
                            <Link
                                className="w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition duration-200"
                                href={'/home'}
                            >
                                Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
            <Navigation2/>
        </>
    );
}
