import {clsx, ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

// easy to use conditional statements in css
// easy to merge css
export const cn = (...inputs: ClassValue[]) => {
    return twMerge(clsx(inputs));
};

export async function post(url, body) {
    await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
    }).then(
        (res) => res.json()
    ).then(
        (res) => {
            return res
        }
    )
}