"use client";

import Link from "next/link";
import React from "react";
// import {useCookies} from "next-client-cookies";

export default function Desktop() {
    // const cookies = useCookies();
    // if (cookies.get('user') === 'false') {
    //     cookies.set('user', 'true');
    // }
    // console.log(`page: ${cookies.get('user')}`)

    return (<>
        <div className="custom-container min-h-screen flex flex-col items-center py-10">
            <div className={`custom-container`}>
                <form
                    // onSubmit={handleSubmit}
                    className="custom-form"
                >
                    <div>
                        <label htmlFor="name">Name:</label>
                        <input
                            type="text"
                            id="name"
                            // value={name}
                            // onChange={(e) => setName(e.target.value)}
                            className="custom-input"
                            placeholder='input name'
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="pw"
                            // value={pw}
                            // onChange={(e) => setPw(e.target.value)}
                            className="custom-input"
                            placeholder='input password'
                            required
                        />
                    </div>
                    <div className='flex-row align-left'>
                        <Link
                            className="custom-btn"
                            href={'/'}
                        >
                            Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    </>)
}