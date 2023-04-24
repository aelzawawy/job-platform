export interface JobPost {
    _id?:any,
    title?: string,
    description?: string,
    location?: {
        address: string,
        coordinates: [number]
    },
    employer?: {
        _id: string,
        name: string,
        image: File
    },
    salary?: number,
    type?: string,
    remote?: boolean,
    date?: string,
    // employer?: string,
    company?: string,
    applictions?: Array<object>,
    available?: boolean,
    saved?: boolean,
}
