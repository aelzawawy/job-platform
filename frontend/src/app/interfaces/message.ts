export interface Message {
  id?:string;
  from?: string;
  to?: string;
  name?: string;
  time?: string;
  sent?: boolean;
  file?: File;
  file_size?: string;
  file_name?: string;
  message?: string;
  _id?: string;
}
