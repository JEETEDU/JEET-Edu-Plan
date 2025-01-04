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

export async function put(url, body) {
    return await fetch(url, {
        method: 'PUT',
        body: JSON.stringify(body)
    }).then(
        (res) => res.json()
    ).then(
        (res) => {
            return res;
        }
    )
}


/**
 * @constructor
 * @param url api url for get datas
 * @param storeName session storage key
 * @param forceUpdate force update stored date (default: false)
 */
export async function getStoreData(url, storeName, forceUpdate = false) {
    if (typeof window === 'undefined') {
        console.warn("sessionStorage is unavailable on the server.");
        return false;
    }

    const storage = sessionStorage;

    async function store() {
        const res = await get(url)
        if (res.success) {
            storage.setItem(storeName, JSON.stringify({
                last_update: new Date(),
                response: res
            }));
            return true;
        } else {
            return false;
        }
    }

    const value = storage.getItem(storeName);

    if (value && !forceUpdate) {
        return JSON.parse(value);
    } else if (await store()) {
        return JSON.parse(storage.getItem(storeName));
    } else {
        return null;
    }
}