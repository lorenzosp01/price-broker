"use client"
import {useEffect, useState} from "react";
import {GCLOUD_LABEL, PROVIDERS} from "@/utils/constants";
import Link from "next/link";
import {GCloudClient} from "@/utils/apiClients";

export default function Page({ params }: { params: { id: string } }) {
    const [token, setToken] = useState("")
    const provider = PROVIDERS[params.id]

    useEffect(() => {
        if(provider.label === GCLOUD_LABEL)
        {
            setToken(GCloudClient.getToken(window.location.href))
        }
    }, [provider])

    return (
        <div className="flex flex-col items-center space-y-16 mt-10">
            <div className="flex flex-col items-center space-y-4 text-3xl">
                <div>
                    {provider.icon}
                </div>
                <div className="font-bold">
                    {provider.name}
                </div>
            </div>
            <div className={`grid ${provider.categories.length == 2 ? "grid-cols-2" : "grid-cols-4"} gap-x-10`}>
                {provider.categories.map((category: any, index: any) =>
                    <Link href={`${params.id}/categories/${category.id}/?token=${token}`} key={index}  className="text-xl border-4 col-span-1 items-center border-transparent p-12 bg-slate-700 text-white hover:border-amber-400 flex flex-col space-y-3 rounded-sm cursor-pointer">
                        <div className="font-bold">{category.name}</div>
                    </Link>
                )}
            </div>
        </div>
    )
}