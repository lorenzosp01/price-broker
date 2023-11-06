"use client"

import {useEffect, useRef, useState} from "react";
import {CATEGORIES, GCLOUD_LABEL, PROVIDERS} from "@/utils/constants";
import {useSearchParams} from "next/navigation";

export default function Page({params}: { params: { id: string, slug: string } }) {
    const provider = PROVIDERS[params.id]
    const searchParams = useSearchParams()
    const client = new PROVIDERS[params.id].client(searchParams.get("token"))
    const category = CATEGORIES[params.slug]
    const endPageScroll = useRef(null)
    const scrollToBottom = () => {
        endPageScroll.current?.scrollIntoView({behavior: "smooth"})
    }

    const [loading, setLoading] = useState(true)
    const [displayInstance, setDisplayInstance] = useState({
        instanceId: ""
    })
    const [instances, setInstances] = useState([])
    const [instanceReports, setInstanceReports] = useState(null)
    const [price, setPrice] = useState(0)
    const getInstanceReports = () => {

        setLoading(true)

        client.getMetricsStatistics(category, displayInstance).then((report: any) => {
            setInstanceReports(report)
        })
    }

    useEffect(() => {
        setLoading(false)
        if (instanceReports) {
            client.getPrice(category, displayInstance, instanceReports).then((price: any) => {
                setPrice(price)
                setLoading(false)
            })
        }
    }, [instanceReports])


    useEffect(() => {
        client.getInstances(category).then((instances: any) => {
            setInstances(instances)
            setLoading(false)
        })

    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [displayInstance, instanceReports])


    return (
        <div className="flex flex-col  items-center space-y-8 mt-10">
            <div className="flex flex-col items-center space-y-4 text-3xl">
                <div>
                    {provider.icon}
                </div>
                <div className="font-bold">
                    {provider.name}
                </div>
            </div>
            <div className="text-2xl">
                {category.name} - Istanze
            </div>
            {!loading || instances.length > 0 ?
                <div className="flex flex-col items-center space-y-4">
                    {
                        instances.map((instance: any, index: any) =>
                            <div key={index} onClick={() => {
                                setDisplayInstance(instance)
                            }}
                                 className={`border-4 col-span-1 items-center ${displayInstance.instanceId === instance.instanceId ? "border-amber-400" : "border-transparent"} p-8 bg-slate-700 text-white hover:border-amber-400 flex flex-col space-y-3 rounded-sm cursor-pointer`}>
                                {Object.keys(instance).map((key: any, index: any) => {
                                    return (
                                        <div key={index}>
                                            <span className="font-bold">{key}</span>: {instance[key]}
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    }
                </div> :
                <div className="text-2xl">
                    Loading...
                </div>
            }
            {
                displayInstance.instanceId ?
                    <div className="w-11/12 flex-col items-center space-y-8 p-4">
                        <hr className="w-11/12 h-1 mx-auto my-4 bg-gray-100 border-0 rounded md:my-10 dark:bg-gray-700"/>
                        <div className="text-center text-2xl">
                            Che cosa vuoi fare con l'istanza {displayInstance.instanceId}?
                        </div>
                        <div className="flex flex-row justify-between">
                            <div onClick={() => getInstanceReports()}
                                 className="text-xl border-4 col-span-1 items-center border-transparent p-10 bg-slate-700 text-white hover:border-amber-400 flex flex-col space-y-3 rounded-sm cursor-pointer">
                                Ottieni utilizzo e costi
                            </div>
                            <div
                                className="text-xl border-4 col-span-1 items-center border-transparent p-10 bg-slate-700 text-white hover:border-amber-400 flex flex-col space-y-3 rounded-sm cursor-pointer">
                                Prevedi utilizzo e costi
                            </div>
                        </div>
                        {
                            !loading ?
                                <div className="flex items-center text-xl flex-col">
                                    {instanceReports ? Object.keys(instanceReports).map((key: any, index: any) => {
                                        return (
                                            <div key={index} className="font-bold">{key}: <span
                                                className="font-normal">{instanceReports[key]}</span></div>
                                        )
                                    }) : null}
                                    {price > 0 ? <div className="font-bold">Prezzo speso: <span
                                        className="font-normal">{price}$</span></div> : null}
                                </div>
                                :
                                <div className="text-center text-xl">
                                    Loading...
                                </div>
                        }
                        <div ref={endPageScroll}/>
                    </div> : null
            }
        </div>
    )
}