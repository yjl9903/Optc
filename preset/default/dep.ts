import axios from 'axios';

export default function (global: any) {
  global.http = axios;
}
