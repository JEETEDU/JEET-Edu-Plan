// import {getStoreData} from "@/app/(main)/components/functions";
import {useEffect} from "react";

type UseEffectCallback = () => Promise<any>
type UseEffectDependencies = Parameters<typeof useEffect>[1]

export function useEffectAsync(asyncCallback: UseEffectCallback, dependencyArray: UseEffectDependencies) {
    useEffect(() => {
        (async () => {
            try {
                await asyncCallback()
            } catch (err) {
                // TODO handle err
                console.log(err);
                alert(String(err));
            }
        })();
    }, [dependencyArray,])
}

// export async function useUserInfo() {
//     return (await getStoreData('/api/user/info', 'user-info')).response.user;
// }