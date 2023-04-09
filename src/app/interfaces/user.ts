export interface User {
    _id?: string,
    name?: string,
    email?: string,
    phone?: string,
    password?: string,
    roles?: string,
    headline?: string,
    location?: string,
    image?:File,
    resume?:File,
    backgoroundImage?:File,
}