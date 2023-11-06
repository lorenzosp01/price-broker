import {CircleStackIcon, CpuChipIcon, InboxStackIcon, SquaresPlusIcon} from "@heroicons/react/24/solid";
import {DocumentIcon} from "@heroicons/react/24/solid";
import GCloud_icon from "../public/GCloud_icon.png";
import Azure_icon from "../public/Azure_icon.png";
import AWS_icon from "../public/AWS_icon.png";
import Image from "next/image";
import {DescribeInstancesCommand} from "@aws-sdk/client-ec2";
import {DescribeDBInstancesCommand} from "@aws-sdk/client-rds";
import {HeadBucketCommand, ListBucketsCommand} from "@aws-sdk/client-s3";
import {AWSClient, GCloudClient, AzureClient} from "@/utils/apiClients";
import {ListContainerInstancesCommand} from "@aws-sdk/client-ecs";

const GCLOUD_VM_WORKLOAD = {
    "name": "vm-workload",
    "computeVmWorkload": {
        "instancesRunning": {
            "usageRateTimeline": {
                "usageRateTimelineEntries": [
                    {
                        "usageRate": 1
                    }
                ]
            }
        },
        "machineType": {
            "predefinedMachineType": {}
        },
    }
}

export const GCLOUD_SERVICES = {
    VM: 'Compute Engine',
    STORAGE: 'Cloud Storage',
}
export const AWS = {
    VM: 'AmazonEC2',
    STORAGE: 'AmazonS3',
    DATABASE: 'AmazonRDS',
    CONTAINER: 'AmazonECS'
}

const GCLOUD_CLOUD_STORAGE_WORKLOAD = {
    "name": "cloud-storage-workload",
    "cloudStorageWorkload": {
        "region": {},
        "dataStored": {
            "usageRateTimeline": {
                "unit": "GiBy",
                "usageRateTimelineEntries": [
                    {}
                ]
            }
        },
        "operationA": {
            "usageRateTimeline": {
                "unit": "1/s",
                "usageRateTimelineEntries": [
                    {}
                ]
            }
        }
    }
}

const AZURE_VM = 'Virtual Machines'
const AZURE_CONTAINER = 'Container Instances'
const AZURE_STORAGE = 'Storage Accounts'
const AZURE_DATABASE = 'SQL Databases'
const GCLOUD_STORAGE = 'Cloud Storage'
const VirtualMachineFormSchema = {
    description: "Configura una macchina virtuale",
    fields: [
        {
            name: "RAM",
            label: "RAM (GiB)",
            type: "text"

        },
        {
            name: "CPU",
            label: "CPU",
            type: "number"
        },
        {
            name: "region",
            label: "Regione",
            type: "select"
        },
        {
            name: "OS",
            label: "Sistema operativo",
            type: "select"
        },
        {
            name: "network",
            label: "Prestazioni di Rete",
            type: "select"
        },
        {
            name: "storage",
            label: "Archiviazione (GiB)",
        }
    ]
}
const ContainerFormSchema = {
    category: "Container",
    description: "Configura l'account per container",
    fields: [
        {
            name: "RAM",
            label: "Seleziona la RAM",
            type: "number"
        },
        {
            name: "CPU",
            label: "Seleziona la CPU",
            type: "number"
        },
        {
            name: "region",
            label: "Seleziona la regione",
            type: "select"
        }
    ]
}
const StorageFormSchema = {
    category: "Storage",
    description: "Configura un account storage",
    fields: [
        {
            name: "storage",
            label: "Storage (GB)",
            type: "number"
        },
        {
            name: "richieste_classe_a",
            label: "Numero richieste PUT, COPY, POST, LIST",
            type: "number"
        },
        {
            name: "richieste_classe_b",
            label: "Numero GET, SELECT e tutte le altre richieste",
            type: "number"
        }
    ]
}
const DatabaseFormSchema = {
    category: "Database",
    description: "Configura un database",
    fields: [
        {
            name: "RAM",
            label: "Seleziona la RAM",
            type: "number"
        },
        {
            name: "CPU",
            label: "Seleziona la CPU",
            type: "number"
        },
        {
            name: "region",
            label: "Seleziona la regione",
            type: "select"
        }
    ]
}
export const fromFieldsToFilters = {
    "RAM": {
        GCLOUD: "computeVmWorkload.machineType.customMachineType.memorySizeGb",
        AWS: "memory",
        AZURE: "memory"
    },
    "CPU": {
        GCLOUD: "computeVmWorkload.machineType.customMachineType.virtualCpuCount",
        AWS: "vcpu",
        AZURE: "vcpu"
    },
    "OS": {
        AWS: "operatingSystem",
    },
    "storage": {
        GCLOUD: "cloudStorageWorkload.dataStored.usageRateTimeline.usageRate",
        AWS: "storage",
    },
    "network": {
        GCLOUD: "computeVmWorkload.networkThroughput",
        AWS: "networkPerformance",
    },
    "region": {
        GCLOUD: "computeVmWorkload.region",
        AWS: "regionCode",
    },
    "instanceType": {
        GCLOUD: "computeVmWorkload.machineType.customMachineType.machineSeries",
        AWS: "instanceType",
    }
}

export const CATEGORIES = [
    {
        id: 0,
        name: "Virtual Machines",
        description: "Macchine virtuali (Calcolo)",
        GCLOUD: {
            label: GCLOUD_SERVICES.VM,
            workload: GCLOUD_VM_WORKLOAD,
        },
        AWS: {
            label: AWS.VM,
            metrics: [{
                namespace: "AWS/EC2",
                metricName: "CPUUtilization",
                dimensions: [
                    {
                        name: "InstanceId",
                        field: "instanceId",
                        value: ""
                    },
                ],
                period: 3600,
                startTime: new Date("2023-09-05"), // required
                endTime: new Date("2023-10-11"),
                statistics: [ // Statistics
                    "Average",
                ],
                unit: "Percent",
            }],
            getInfoCommand: DescribeInstancesCommand,
            detailsToFilters: [
                {
                    instanceDetail: "InstanceType",
                    filter: "instanceType"
                },
                {
                    instanceDetail: "InstanceId",
                    filter: "instanceId",
                }
            ]
        },
        AZURE: AZURE_VM,
        icon: <CpuChipIcon className="w-12 h-12 text-white"/>,
        schema: VirtualMachineFormSchema,
    },
    {
        id: 1,
        name: "Containers",
        description: "Container",
        AWS: {
            label: AWS.CONTAINER,
            getInfoCommand: ListContainerInstancesCommand,
        },
        AZURE: AZURE_CONTAINER,
        icon: <SquaresPlusIcon className="w-12 h-12 text-white"/>,
        schema: ContainerFormSchema
    },
    {
        id: 2,
        name: "Storage",
        description: "Archiviazione",
        GCLOUD: {
            label: GCLOUD_SERVICES.STORAGE,
            workload: GCLOUD_CLOUD_STORAGE_WORKLOAD,
        },
        AWS: {
            metrics: [
                {
                    namespace: "AWS/S3",
                    metricName: "AllRequests",
                    dimensions: [
                        {
                            name: "BucketName",
                            field: "instanceId",
                            value: ""
                        },
                        {
                            name: "FilterId",
                            field: "",
                            value: "Richieste"
                        }
                    ],
                    statistics: [
                        "Sum"
                    ],
                    startTime: new Date("2023-09-05"), // required
                    endTime: new Date("2023-09-23"),
                    period: 86400,
                    unit: "Count"
                },
                {
                    namespace: "AWS/S3",
                    metricName: "BucketSizeBytes",
                    dimensions: [
                        {
                            name: "BucketName",
                            field: "instanceId",
                            value: ""
                        },
                        {
                            name: "StorageType",
                            field: "",
                            value: "AllStorageTypes"
                        }
                    ],
                    statistics: [
                        "Average"
                    ],
                    startTime: new Date("2023-09-05"), // required
                    endTime: new Date("2023-11-05"),
                    period: 43200,
                    unit: "Count"
                }
            ],
            label: AWS.STORAGE,
            detailsToFilters: [
                {
                    instanceDetail: "Name",
                    filter: "instanceId"
                },
            ],
        },
        AZURE: {
            label: AZURE_STORAGE,
            metrics: [
                "Write Operations",
                "Read Operations",
                "Data Stored",
            ]
        },
        icon: <InboxStackIcon className="w-12 h-12 text-white"/>,
        schema: StorageFormSchema
    },
    {
        id: 3,
        name: "Databases",
        description: "Database",
        AWS: {
            label: AWS.DATABASE,
            metrics: [{
                namespace: "AWS/RDS",
                metricName: "CPUUtilization",
                dimensions: [
                    {
                        name: "DBInstanceIdentifier",
                        field: "instanceId",
                        value: ""
                    }
                ],
                period: 3600,
                startTime: new Date("2023-09-16"), // required
                endTime: new Date("2023-09-23"),
                statistics: [ // Statistics
                    "Average",
                ],
                unit: "Percent",
            }],
            getInfoCommand: DescribeDBInstancesCommand,
            detailsToFilters: [
                {
                    instanceDetail: "DBInstanceClass",
                    filter: "instanceType"
                },
                {
                    instanceDetail: "Engine",
                    filter: "engine"
                },
                {
                    instanceDetail: "DBInstanceIdentifier",
                    filter: "instanceId"
                }
            ]
        },
        AZURE: [
            "cpu_percent",
            "storage_used",
        ],
        icon: <CircleStackIcon className="w-12 h-12 text-white "/>,
        schema: DatabaseFormSchema
    }
]


export const AWS_LABEL = "AWS"
export const AZURE_LABEL = "AZURE"
export const GCLOUD_LABEL = "GCLOUD"


export const PROVIDERS = [
    {
        label: GCLOUD_LABEL,
        name: "Google Cloud",
        description: "Google Cloud Platform",
        icon: <Image src={GCloud_icon} height={60}/>,
        categories: [CATEGORIES[0], CATEGORIES[2]],
        client: GCloudClient

    },
    {
        label: AWS_LABEL,
        name: "Amazon Web Services",
        description: "Amazon Web Services",
        icon: <Image src={AWS_icon} height={60}/>,
        categories: [CATEGORIES[0], CATEGORIES[1], CATEGORIES[2], CATEGORIES[3]],
        client: AWSClient
    },
    {
        label: AZURE_LABEL,
        name: "Microsoft Azure",
        description: "Microsoft Azure",
        icon: <Image src={Azure_icon} height={60}/>,
        categories: [CATEGORIES[0], CATEGORIES[1], CATEGORIES[2], CATEGORIES[3]],
        client: AzureClient
    }
]