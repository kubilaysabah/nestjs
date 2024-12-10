import { Injectable } from '@nestjs/common';
import * as xml2js from 'xml2js';

@Injectable()
export class XmlToJSONService {
  parse<T>(xml: string): Promise<T> {
    return new Promise((resolve, reject) => {
      xml2js.parseString(xml, (err, result: T) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    });
  }
}
