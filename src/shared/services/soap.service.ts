import { Injectable } from '@nestjs/common';
import { soap } from 'strong-soap';

@Injectable()
export class SoapService {
  async client<T>({
    url,
    username,
    password,
  }: {
    url: string;
    username: string;
    password: string;
  }): Promise<T> {
    return new Promise((resolve, reject) => {
      soap.createClient(url, {}, (err, client) => {
        if (err) {
          reject(err);
        }
        const wsSecurity = new soap.WSSecurity(username, password);
        client.setSecurity(wsSecurity);
        resolve(client);
      });
    });
  }
}
