import Navigation from "@/app/components/desktop/Navigation";
import Link from "next/link";
import React from "react";

export default function Desktop() {
    return (<>
        <Navigation/>
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
                            type="submit"
                            className="custom-btn"
                            href={}
                        >
                            Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    </>)
}