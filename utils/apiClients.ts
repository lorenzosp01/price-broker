// Set the AWS Region.
// Create an Amazon S3 service client object.
import {
    PricingClient,
    GetAttributeValuesCommand,
    GetProductsCommand,
    DescribeServicesCommand
} from "@aws-sdk/client-pricing";
import {CATEGORIES, fromFieldsToFilters, AWS, GCLOUD_SERVICES} from "@/utils/constants";
import {CloudWatchClient, GetMetricStatisticsCommand} from "@aws-sdk/client-cloudwatch";
import {DescribeInstancesCommand, DescribeInstanceStatusCommand, EC2} from "@aws-sdk/client-ec2";
import {CreateBucketCommand, GetObjectCommand, PutBucketCorsCommand, S3} from "@aws-sdk/client-s3";
import {DescribeDBInstancesCommand, RDS} from "@aws-sdk/client-rds";
import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';
import fetch from "node-fetch";
import {machine} from "os";
import {json} from "stream/consumers";
import {ECS} from "@aws-sdk/client-ecs";
import {date, nan} from "zod";

type FormFields = {
    [key: string]: string
}

// Imports the Google Cloud client library

class AzureClient {
    static APIEndpoint = "https://prices.azure.com/api/retail/prices"
    public location: string;

    constructor(location: string) {
        this.location = location
    }

    getToken() {
        let fragmentString = location.hash.substring(1);
        // Parse query string to see if page request is coming from OAuth 2.0 server.
        let queryParams = {};
        let regex = /([^&=]+)=([^&]*)/g, m;
        while (m = regex.exec(fragmentString)) {
            queryParams[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
        }

        if (!queryParams['access_token']) {
            let oauth2Endpoint = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
            let form = document.createElement('form');
            form.setAttribute('method', 'GET'); // Send as a GET request.
            form.setAttribute('action', oauth2Endpoint);

            // Parameters to pass to OAuth 2.0 endpoint.
            let params = {
                'client_id': "027edb4b-3136-4718-97d2-7dc55e98cff2",
                'response_type': 'token',
                'scope': 'https://management.azure.com/user_impersonation',
            };

            // Add form parameters as hidden input values.
            for (let p in params) {
                let input = document.createElement('input');
                input.setAttribute('type', 'hidden');
                input.setAttribute('name', p);
                input.setAttribute('value', params[p]);
                form.appendChild(input);
            }

            // Add form to page and submit it to open the OAuth 2.0 endpoint.
            document.body.appendChild(form);
            form.submit();
        } else {
            console.log("access_token", queryParams['access_token'])
            return queryParams['token']
        }

        return "dd"
    }

    // getToken(code) {
    //     let fragmentString = location.search.substring(1);
    //
    //     // Parse query string to see if page request is coming from OAuth 2.0 server.
    //     let queryParams = {};
    //     let regex = /([^&=]+)=([^&]*)/g, m;
    //     while (m = regex.exec(fragmentString)) {
    //         queryParams[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    //     }
    //
    //     if (!queryParams['token']) {
    //         let oauth2Endpoint = 'https://login.microsoftonline.com/common/oauth2/token';
    //         let form = document.createElement('form');
    //         form.setAttribute('method', 'POST'); // Send as a GET request.
    //         form.setAttribute('action', oauth2Endpoint);
    //
    //         // Parameters to pass to OAuth 2.0 endpoint.
    //         let params = {
    //             'client_id': "027edb4b-3136-4718-97d2-7dc55e98cff2",
    //             'grant_type': 'authorization_code',
    //             'code': code,
    //         };
    //
    //         // Add form parameters as hidden input values.
    //         for (let p in params) {
    //             let input = document.createElement('input');
    //             input.setAttribute('type', 'hidden');
    //             input.setAttribute('name', p);
    //             input.setAttribute('value', params[p]);
    //             form.appendChild(input);
    //         }
    //
    //         // Add form to page and submit it to open the OAuth 2.0 endpoint.
    //         document.body.appendChild(form);
    //         form.submit();
    //     }
    //
    //     console.log("token", queryParams['token'])
    // }

    // async getPrice(service: string, formFields: FormFields[]) {
    //     const APIEndpoint = `${AzureClient.APIEndpoint}?$filter=serviceName eq '${service}' and filter=Location eq '${this.location}`
    //     const response = await fetch(APIEndpoint)
    //
    //     const data = await response.json()
    //     return data
    // }
}

// API non supporta il calcolo del costo per container, database
class GCloudClient {
    static APIEndpoint = "https://cloudbilling.googleapis.com/v1beta:estimateCostScenario?" + new URLSearchParams({
        key: 'AIzaSyCVGl-P1JZZk7UFpx4VRdNelghsIKI2eI8',
    })
    public location: string;
    private accessToken: string;
    private API_KEY: string;
    private project: string;

    constructor(token: string) {
        this.location = "us-east1-b"
        this.API_KEY = "AIzaSyDZ7K5tVlZK3_JdvU4MFlBJ8sZqrM8NvRc"
        this.accessToken = token
        this.project = "copper-seeker-400318"
    }

    static getToken(redirectUri: string) {

        let YOUR_CLIENT_ID = '425375687027-c6ph89jor8r5aes4vn9l4hpsthm70prj.apps.googleusercontent.com';
        let YOUR_REDIRECT_URI = redirectUri;
        let fragmentString = location.hash.substring(1);

        // Parse query string to see if page request is coming from OAuth 2.0 server.
        let params: any = [];
        let regex = /([^&=]+)=([^&]*)/g, m;

        while (m = regex.exec(fragmentString)) {
            params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
        }
        /*
         * Create form to request access token from Google's OAuth 2.0 server.
         */

        if (!params['access_token']) {
            let oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

            // Create element to open OAuth 2.0 endpoint in new window.
            let form = document.createElement('form');
            form.setAttribute('method', 'GET'); // Send as a GET request.
            form.setAttribute('action', oauth2Endpoint);

            // Parameters to pass to OAuth 2.0 endpoint.
            let params = {
                'client_id': YOUR_CLIENT_ID,
                'redirect_uri': YOUR_REDIRECT_URI,
                'scope': 'https://www.googleapis.com/auth/monitoring https://www.googleapis.com/auth/compute https://www.googleapis.com/auth/cloud-platform',
                // 'state': 'try_sample_request',
                'include_granted_scopes': 'true',
                'response_type': 'token'
            };

            // Add form parameters as hidden input values.
            for (let p in params) {
                let input = document.createElement('input');
                input.setAttribute('type', 'hidden');
                input.setAttribute('name', p);
                input.setAttribute('value', params[p]);
                form.appendChild(input);
            }

            // Add form to page and submit it to open the OAuth 2.0 endpoint.
            document.body.appendChild(form);
            form.submit();
        } else {
            return params['access_token']
        }
    }

    async makeRequest(url: string, options: any) {
        options.headers = {
            Authorization: `Bearer ${this.accessToken}`
        }
        return fetch(url, options)
    }

    setProject(projectId: string) {
        this.project = projectId
    }

    async getProjects() {
        let projects: any = []
        const response = await this.makeRequest("https://cloudresourcemanager.googleapis.com/v1/projects", {
            method: "GET",
        })

        const data = await response.json()

        return data.projects
    }


    async getInstances(category: any) {
        let url = ""
        let response: any
        let instances: any
        switch (category.GCLOUD.label) {
            case GCLOUD_SERVICES.VM:
                url = `https://compute.googleapis.com/compute/v1/projects/${this.project}/aggregated/instances`
                response = await this.makeRequest(url, {})
                instances = await response.json()
                instances = instances.items[`zones/${this.location}`]['instances']
                break
            case GCLOUD_SERVICES.STORAGE:
                url = `https://storage.googleapis.com/storage/v1/b?project=${this.project}`
                response = await this.makeRequest(url, {})
                instances = await response.json()
                instances = instances.items
                break
        }

        instances = instances.map((instance: any) => {
            return {
                instanceId: instance.name,
            }
        })

        console.log(instances)
        return instances
    }

    async getPrice(category: any, instance: any, metrics: number) {
        let url = `https://cloudbilling.googleapis.com/v1beta:estimateCostScenario?key=${this.API_KEY}`
        let requestBody = {
            "costScenario": {
                "scenarioConfig": {
                    "estimateDuration": metrics.uptimeHours ? metrics.uptimeHours * 60 * 60 + "s" : "2628000s" // 1 day
                }
            }
        }


        let response, workload, urlMachineType, machineType;

        switch (category.GCLOUD.label) {
            case GCLOUD_SERVICES.VM:
                // scenario config: usage duration to take from metrics
                urlMachineType = instance.machineType
                response = await this.makeRequest(urlMachineType, {})
                machineType = await response.json()

                workload = category.GCLOUD.workload
                workload.computeVmWorkload.machineType.predefinedMachineType = {
                    machineType: machineType.name,
                }

                workload.computeVmWorkload.region = this.location.split("-").splice(0, 2).join("-")
                break
            case GCLOUD_SERVICES.STORAGE:
                workload = category.GCLOUD.workload
                workload.cloudStorageWorkload.dataStored.usageRateTimeline.usageRateTimelineEntries[0].usageRate = metrics.totalBytes
                workload.cloudStorageWorkload.operationA.usageRateTimeline.usageRateTimelineEntries[0].usageRate = metrics.totalRequests / 2628000
                workload.cloudStorageWorkload.region.name = this.location.split("-").splice(0, 2).join("-")
                workload.cloudStorageWorkload.storageClass = instance.storageClass.toLowerCase()
                break
        }

        console.log(workload)

        requestBody.costScenario.workloads = [
            workload
        ]

        response = await this.makeRequest(url, {
            method: "POST",
            body: JSON.stringify(requestBody)
        })

        const estimationResult = await response.json()

        let priceObject = estimationResult.costEstimationResult.segmentCostEstimates[0].workloadCostEstimates[0].workloadTotalCostEstimate.netCostEstimate
        let price;
        if (priceObject) {
            let nanos = priceObject.nanos / 1000000000
            if (priceObject.units) {
                price = priceObject.units
                price = Number(price) + Number(nanos)
            } else {
                price = nanos
            }
        }

        return price
    }

    async getMetricsStatistics(category: any, instance: any) {
        let url = `https://monitoring.googleapis.com/v3/projects/${this.project}/timeSeries`
        let response, startTime, endTime, filter, finalMetrics
        startTime = "2023-09-25T15:01:23Z"
        endTime = new Date().toISOString()
        console.log(endTime)

        switch (category.GCLOUD.label) {
            case GCLOUD_SERVICES.VM:
                filter = "metric.type = \"compute.googleapis.com/instance/cpu/utilization\" " +
                    "AND metric.labels.instance_name = \"instance-2\""
                break
            case GCLOUD_SERVICES.STORAGE:
                filter = `metric.type=\"storage.googleapis.com/api/request_count\" 
                 AND resource.labels.bucket_name = \"${instance.name}\"`
                break
        }

        url += `?filter=${filter}&interval.startTime=${startTime}&interval.endTime=${endTime}`
        response = await this.makeRequest(url, {})
        let metricResult = await response.json()

        switch (category.GCLOUD.label) {
            case GCLOUD_SERVICES.VM:
                finalMetrics = {
                    uptimeHours: metricResult.timeSeries[0].points.length / 60,
                }
                break
            case GCLOUD_SERVICES.STORAGE:
                let totalRequests = 0;
                metricResult.timeSeries.forEach((metric: any) => {
                    metric.points.forEach((point: any) => {
                        totalRequests += Number(point.value.int64Value)
                    })
                })

                finalMetrics = {
                    totalRequests: totalRequests,
                }

                filter = `metric.type=\"storage.googleapis.com/storage/total_bytes\" 
                 AND resource.labels.bucket_name = \"${instance.name}\"`

                url = `https://monitoring.googleapis.com/v3/projects/${this.project}/timeSeries?filter=${filter}&interval.startTime=${startTime}&interval.endTime=${endTime}`
                response = await this.makeRequest(url, {})
                metricResult = await response.json()

                let pointsLength = metricResult.timeSeries[0].points.length

                finalMetrics.totalBytes = metricResult.timeSeries[0].points[pointsLength - 1].value.doubleValue

                break
        }

        return finalMetrics
    }

    async getPriceEvaluation(category: any, instance: any) {

        // Scegliere l'istanza
        // Vedere quanto utilizzo è stato fatto
        let metrics = this.getMetricsStatistics(
            category,
            instance
        )

        let total_price = this.getPrice(
            category,
            instance
        )

    }

}

class AWSClient {
    public location: string;
    public serviceClients: any;
    public credentials: any;
    public pricingClient: PricingClient;
    public cloudWatchClient: CloudWatchClient;

    constructor() {
        this.location = "us-east-1"
        this.credentials = {
            accessKeyId: "AKIAV4PUD7F2Y3QEQS5T",
            secretAccessKey: "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",
        }
        this.serviceClients = {}
        this.serviceClients[AWS.DATABASE] = new RDS({
            credentials: this.credentials,
            region: this.location,
        })
        this.serviceClients[AWS.VM] = new EC2({
            credentials: this.credentials,
            region: this.location,
        })
        this.serviceClients[AWS.CONTAINER] = new ECS({
            credentials: this.credentials,
            region: this.location,
        })
        this.serviceClients[AWS.STORAGE] = new S3({
            credentials: this.credentials,
            region: this.location,
        });
        this.pricingClient = new PricingClient({
            credentials: this.credentials,
            region: this.location,
        });
        this.cloudWatchClient = new CloudWatchClient({
            credentials: this.credentials,
            region: this.location,
        });

    }

    async getInstances(category: any) {
        let instances = [] as any
        let responseInstances = []
        let options = {}
        let response: any

        if (category.AWS.label !== AWS.STORAGE) {
            response = await this.serviceClients[category.AWS.label].send(new category.AWS.getInfoCommand(options));
        }

        switch (category.AWS.label) {
            case AWS.VM:
                responseInstances = response.Reservations?.map((reservation: any) => reservation.Instances[0])
                console.log(responseInstances)
                responseInstances.forEach((instance: any) => {
                    instances.push({
                        instanceId: instance.InstanceId,
                        instanceType: instance.InstanceType,
                        state: instance.State.Name,
                        operatingSystem: instance.PlatformDetails.split("/")[0],
                    })
                })
                break
            case AWS.DATABASE:
                responseInstances = response.DBInstances
                responseInstances.forEach((instance: any) => {
                    instances.push({
                        instanceId: instance.DBInstanceIdentifier,
                        instanceType: instance.DBInstanceClass,
                        databaseEngine: instance.Engine === "postgres" ? "PostgreSQL" : instance.Engine,
                    })
                })
                break
            case AWS.CONTAINER:
                // responseInstances = response.clusters
                break
            case AWS.STORAGE:
                let url = "http://localhost:8000/broker/list_buckets"
                let response = await fetch(url, {
                    method: "GET",
                })
                responseInstances = await response.json()
                responseInstances = responseInstances.Buckets
                responseInstances.forEach((instance: any) => {
                    instances.push({
                        instanceId: instance.Name
                    })
                })
                break
        }

        return instances
    }

    getInstanceFilters(category: any, instance: any) {
        let instanceFilters = {}

        for (const obj in category.AWS.detailsToFilters) {
            let filter = category.AWS.detailsToFilters[obj].filter
            instanceFilters[filter] = instance[category.AWS.detailsToFilters[obj].instanceDetail]
        }

        return instanceFilters
    }


    async getMetricsStatistics(category: any, instance: any) {
        let responseResult = {} as any
        let metricsResult = {} as any

        for (const metric of category.AWS.metrics) {
            const input = {
                Namespace: metric.namespace,
                MetricName: metric.metricName,
                Dimensions: metric.dimensions.map((dimension: any) => {
                    return {
                        Name: dimension.name,
                        Value: dimension.field != "" ? instance[dimension.field] : dimension.value
                    }
                }),
                StartTime: metric.startTime, // required
                EndTime: metric.endTime, // required
                Period: metric.period, // required
                Statistics: metric.statistics, // required
                Unit: metric.unit,
            }

            const command = new GetMetricStatisticsCommand(input);
            const response = await this.cloudWatchClient.send(command);
            responseResult[metric.metricName] = response.Datapoints
        }

        console.log(responseResult)
        switch (category.AWS.label) {
            case AWS.VM:
                metricsResult.uptimeHours = responseResult.CPUUtilization?.length
                break;
            case AWS.STORAGE:
                let totalBytes = 0
                let totalRequests = 0

                responseResult.AllRequests.forEach((datapoint: any) => {
                    totalRequests += datapoint.Sum
                })

                let bytesArrayLength = responseResult.BucketSizeBytes.length
                if (bytesArrayLength > 0) {
                    totalBytes = responseResult.BucketSizeBytes[bytesArrayLength - 1].Average
                }

                metricsResult.totalBytes = totalBytes
                metricsResult.totalRequests = totalRequests
                break;
            case AWS.DATABASE:
                metricsResult.uptimeHours = responseResult.CPUUtilization?.length

                break;
        }

        return metricsResult
    }

    async getPrice(category: any, instance: any, instanceReports: any) {
        const input = {
            Filters: [
                {
                    Type: "TERM_MATCH",
                    Field: 'ServiceCode',
                    Value: category.AWS.label
                },
                {
                    Type: "TERM_MATCH",
                    Field: "regionCode",
                    Value: "us-east-1"
                },
            ],
            MaxResults: 1,
            ServiceCode: category.AWS.label,
        }

        // console.log(input)
        Object.keys(instance).forEach((key) => {
            if (key !== "state" && key !== "instanceId") {
                input.Filters.push({
                    Type: "TERM_MATCH",
                    Field: key,
                    Value: instance[key]
                })
            }
        })

        const command = new GetProductsCommand(input);
        const response = await this.pricingClient.send(command);

        // You can return Date, Map, Set, etc.
        if (!response) {
            // This will activate the closest `error.js` Error Boundary
            console.log("error")
            throw new Error('Failed to fetch data')
        }

        let price = 0
        console.log(response)
        if (response.PriceList.length > 0) {
            let priceObject = JSON.parse(response.PriceList[0])
            // response.PriceList.forEach((price: any) => {
            //     console.log(JSON.parse(price))
            // })
            // console.log(priceObject)
            let sku = priceObject["product"].sku
            price = priceObject["terms"]["OnDemand"][sku + ".JRTCKXETXF"]["priceDimensions"][sku + ".JRTCKXETXF.6YS6EN2CT7"]["pricePerUnit"]["USD"]
        }

        switch (category.AWS.label) {
            case AWS.VM:
                let uptimeHours = instanceReports.uptimeHours
                price = Math.round(price * uptimeHours)
                break
            case AWS.STORAGE:
                let totalBytes = instanceReports.totalBytes / 1000000000
                let totalRequests = instanceReports.totalRequests / 1000

                let filters = [
                    {
                        MetricName: "totalBytes",
                        MetricValue: totalBytes,
                        Filter: {
                            Type: "TERM_MATCH",
                            Field: 'usageType',
                            Value: "Requests-Tier1"
                        }
                    },
                    {
                        MetricName: "totalRequests",
                        MetricValue: totalRequests,
                        Filter: {
                            Type: "TERM_MATCH",
                            Field: "usageType",
                            Value: "TimedStorage-ByteHrs"
                        }
                    }
                ]

                for (const filter of filters) {
                    const input = {
                        Filters: [
                            {
                                Type: "TERM_MATCH",
                                Field: 'ServiceCode',
                                Value: category.AWS.label
                            },
                            {
                                Type: "TERM_MATCH",
                                Field: "regionCode",
                                Value: "us-east-1"
                            },
                            filter.Filter
                        ],
                        MaxResults: 1,
                        ServiceCode: category.AWS.label,
                    }

                    const command = new GetProductsCommand(input);
                    const response = await this.pricingClient.send(command);

                    let priceObject = JSON.parse(response.PriceList[0])
                    let sku = priceObject["product"].sku
                    price += priceObject["terms"]["OnDemand"][sku + ".JRTCKXETXF"]["priceDimensions"][sku + ".JRTCKXETXF.6YS6EN2CT7"]["pricePerUnit"]["USD"] * filter.MetricValue
                    console.log(price)
                }
                break
            case AWS.DATABASE:
                let uptimeHoursDB = instanceReports.uptimeHours
                price = Math.round(price * uptimeHoursDB)
                break
        }

        return price
    }


    // async describeServices(service: string) {
    //     const input = {
    //         ServiceCode: service,
    //     }
    //
    //     const command = new DescribeServicesCommand(input);
    //     const response = await this.pricingClient.send(command);
    //
    //     // The return value is *not* serialized
    //     console.log(response)
    // }
    //
    async getAttributeValues(service: string) {
        const input = {
            AttributeName: "usageType",
            ServiceCode: "AmazonS3",
            MaxResults: 100,
        }


        const command = new GetAttributeValuesCommand(input);
        const response = await this.pricingClient.send(command);
        // The return value is *not* serialized
        console.log(response)
        // You can return Date, Map, Set, etc.
        if (!response) {
            // This will activate the closest `error.js` Error Boundary
            throw new Error('Failed to fetch data')
        }
    }

}

export {
    AzureClient, GCloudClient, AWSClient
};
