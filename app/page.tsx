'use client';
import {CATEGORIES, GCLOUD_SERVICES, PROVIDERS} from '../utils/constants';
import {Button} from "@/components/Button";
import {useEffect, useState} from "react";
import {useAppContext} from "@/AppContext";
import {AWSClient, AzureClient, GCloudClient} from "@/utils/apiClients";


import { ListBucketsCommand, S3Client } from "@aws-sdk/client-s3";
export default function Home() {
    const {category, setCategory} = useAppContext()
    const {provider, setProvider} = useAppContext()


    return <main className="flex flex-col h-full items-center justify-center space-y-32 px-20 py-8">
        <div className="text-2xl font-semibold">
            Scegli il servizio che vuoi utilizzare
        </div>
        <div className="grid grid-cols-3 gap-6">
            {
                PROVIDERS.map((provider, index) =>
                    <Button key={index} provider={provider} index={index}/>
                )
            }
        </div>
    </main>
}
