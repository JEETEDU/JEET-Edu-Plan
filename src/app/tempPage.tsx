'use client';

import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import Alert from "./components/alert";

interface User {
    id: number;
    name: string;
    password: string;
    showPassword?: boolean;
}

export default function Home() {
    const [name, setName] = useState('');
    const [pw, setPw] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [userList, setUserList] = useState<User[]>([]);

    const router = useRouter();

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/getUserList');
            const result = await response.json();

            if (result.success) {
                setUserList(result.message);
            } else {
                console.error('Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/insert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({name, pw}),
            });

            const result = await response.json();

            if (result.success) {
                setAlertMessage('User added successfully');
                setShowAlert(true);
                await fetchUsers();
                router.refresh();
            } else {
                setAlertMessage('Failed to add user');
                setShowAlert(true);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleDeleteUser = async (id: number) => {
        try {
            const response = await fetch(`/api/delete/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(id),
            });

            const result = await response.json();

            if (result.success) {
                setAlertMessage('User deleted successfully');
                setShowAlert(true);
                await fetchUsers();
            } else {
                setAlertMessage('Failed to delete user');
                setShowAlert(true);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handlePasswordToggle = (index: number) => {
        setUserList((prev) =>
            prev.map((user, i) =>
                i === index ? {...user, showPassword: !user.showPassword} : user
            )
        );
    };

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
        if (!isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <div className="custom-container min-h-screen flex flex-col items-center py-10">
            <button
                onClick={toggleTheme}
                className="py-2 px-4 rounded bg-gray-300 dark:bg-gray-700">
                {isDarkMode ? '라이트 모드' : '다크 모드'}
            </button>
            <div className={`custom-container ${isDarkMode ? 'dark' : ''}`}>
                <form onSubmit={handleSubmit} className="custom-form">
                    <div>
                        <label htmlFor="name">Name:</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="custom-input"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="pw"
                            value={pw}
                            onChange={(e) => setPw(e.target.value)}
                            className="custom-input"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="custom-btn"
                    >
                        Add User
                    </button>
                </form>
                {showAlert && (
                    <Alert
                        message={alertMessage}
                        onClose={() => setShowAlert(false)}
                    />
                )}
            </div>
            <div className="mt-8 min-w-full px-10">
                <h2 className="text-lg font-bold mb-4">로그인한 사용자 목록</h2>
                <table className="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                    <thead>
                    <tr className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200">
                        <th className="py-3 px-4 text-left">ID</th>
                        <th className="py-3 px-4 text-left">이름</th>
                        <th className="py-3 px-4 text-left">비밀번호</th>
                        <th className="py-3 px-4 text-left">작업</th>
                    </tr>
                    </thead>
                    <tbody className="text-gray-600 dark:text-gray-300">
                    {userList.map((user, index) => (
                        <tr key={user.id} className="hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-300">
                            <td className="py-3 px-4 border-b">{user.id}</td>
                            <td className="py-3 px-4 border-b">{user.name}</td>
                            <td className="py-3 px-4 border-b">
                                <span className="relative flex items-center w-full">
                                    <input
                                        type={user.showPassword ? 'text' : 'password'}
                                        value={user.password}
                                        readOnly
                                        className="bg-transparent border-none w-fit"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handlePasswordToggle(index)}
                                        className="ml-2 text-blue-600 hover:underline flex items-center"
                                    >
                                        <div className={`${user.showPassword ? 'i-heroicons-eye-solid' : 'i-heroicons-eye-slash-solid'}`}/>

                                    </button>
                                </span>
                            </td>
                            <td className="py-3 px-4 border-b">
                                <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="text-red-600 hover:underline"
                                >
                                    삭제
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}