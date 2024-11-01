import Navigation from "@/app/components/desktop/Navigation";
import Link from "next/link";
import React from "react";

export default function Desktop() {
    return (
        <>
            <Navigation />
            <div className="custom-container min-h-screen flex flex-col items-center justify-center py-10 bg-gray-100 dark:bg-gray-900">
                <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg p-8">
                    <h2 className="text-2xl font-semibold text-center text-gray-700 dark:text-gray-200 mb-6">
                        Login
                    </h2>
                    <form className="custom-form space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                                Name:
                            </label>
                            <input
                                type="text"
                                id="name"
                                className="custom-input w-full px-4 py-2 border rounded-lg border-gray-300 dark:border-gray-600 focus:(outline-none ring-2 ring-blue-400) bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
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
                                className="custom-input w-full px-4 py-2 border rounded-lg border-gray-300 dark:border-gray-600 focus:(outline-none ring-2 ring-blue-400) bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <div className="flex justify-center">
                            <Link
                                className="custom-btn w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition duration-200"
                                href={'/home'}
                            >
                                Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}
