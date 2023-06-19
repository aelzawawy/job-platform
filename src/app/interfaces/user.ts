export interface User {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  roles?: string;
  headline?: string;
  industry?: string;
  about?: string;
  skills?: Array<string>;
  fcmToken?: string;
  location?: {
    address: string;
    coordinates?: [number];
  };
  contactList?: [
    {
      contact: string;
      newMsg: boolean;
    }
  ];
  image?: File;
  resume?: File;
  backgoroundImage?: File;
  online?: boolean;
  lastActive?: string;
}
