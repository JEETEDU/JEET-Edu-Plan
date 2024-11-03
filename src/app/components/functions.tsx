import {clsx, ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

// easy to use conditional statements in css
// easy to merge css
export const cn = (...inputs: ClassValue[]) => {
    return twMerge(clsx(inputs));
};