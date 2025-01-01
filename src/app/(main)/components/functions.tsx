import {clsx, ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

// easy to use conditional statements in css
// easy to merge css
export const cn = (...inputs: ClassValue[]) => {
    return twMerge(clsx(inputs));
};

export async function post(url, body) {
    return await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
    }).then(
        (res) => res.json()
    ).then(
        (res) => {
            return res;
        }
    )
}

export async function get(url) {
    return await fetch(url, {
        method: 'GET',
    }).then(
        (res) => res.json()
    ).then(
        (res) => {
            return res;
        }
    )
}

async function setUserInfo() {
    if (typeof window === 'undefined') {
        console.warn("sessionStorage is unavailable on the server.");
        return false;
    }

    const storage = sessionStorage;

    const res = await get('/api/user/info')
    if (res.success) {
        storage.setItem('uid', res.user.uid)
        storage.setItem('login_id', res.user.login_id)
        storage.setItem('user_type', res.user.user_type)
        storage.setItem('name', res.user.name)
        storage.setItem('first_year', res.user.first_year)
        storage.setItem('school', res.user.school)
        storage.setItem('joined_term', res.user.joined_term)

        return true;
    } else {
        return false;
    }
}

export async function getUserInfo(data) {
    if (typeof window === 'undefined') {
        console.warn("sessionStorage is unavailable on the server.");
        return null;
    }

    const value = sessionStorage.getItem(data);

    if (value) {
        return value;
    } else {
        const success = await setUserInfo();
        if (success) {
            return sessionStorage.getItem(data);
        } else {
            return null;
        }
    }
}