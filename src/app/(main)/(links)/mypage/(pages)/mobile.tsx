// 'use client';
//
// import {getStoreData, post} from "@/app/(main)/components/functions";
// import React, {useEffect, useState} from "react";
// import {useRouter} from "next/navigation";
//
// export default function Mobile() {
//     const [error, setError] = useState("");
//     const router = useRouter();
//
//     const [name, setName] = useState("Loading...");
//     const [grade, setGrade] = useState("Loading...");
//     const [school, setSchool] = useState("Loading...");
//
//     useEffect(() => {
//         (async () => {
//             const userInfo = await getStoreData('/api/user/info', 'user-info');
//
//             setName(userInfo.name);
//             setGrade(userInfo.first_year);
//             setSchool(userInfo.school);
//
//             console.log(userInfo)
//         })().then(r => console.log(r));
//     }, []);
//
//     const logout = async () => {
//         const res = await post("/api/user/logout", {})
//         if (res.success) {
//             router.push('/');
//         } else {
//             setError(res.message);
//         }
//     }
//
//     return (
//         <>
//             <div className='text-red-600 font-bold'>
//                 {error}
//             </div>
//
//             <div className="w-full h-full flex flex-col items-center bg-gray-100">
//                 <div className="w-full flex flex-row justify-between items-center py-3 px-6">
//                     <div className="text-4xl font-bold text-gray-800">
//                         {name}
//                     </div>
//                     <div className="w-fit flex flex-col items-end">
//                         <div className="text-left text-xl font-bold text-gray-800">
//                             {/*{user.grade}*/}
//                             {/*{user !== null && user.first_year}*/}
//                         </div>
//                         <div className="text-left text-l font-bold text-gray-600">
//                             {/*{user.school}*/}
//                             {/*{user !== null && user.school}*/}
//                         </div>
//                     </div>
//                 </div>
//
//                 <div
//                     className="mt-6 px-4 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600"
//                     onClick={logout}
//                 >
//                     로그아웃
//                 </div>
//             </div>
//         </>
//     )
// }