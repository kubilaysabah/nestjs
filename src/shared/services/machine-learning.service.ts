import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as process from 'node:process';

@Injectable()
export class MachineLearningService {
  private readonly baseURL: string =
    'https://api-inference.huggingface.co/models/';

  async sentenceSimilarity<T>(body: {
    source_sentence: string;
    sentences: string[];
  }): Promise<T> {
    const response = await axios<T>({
      baseURL: this.baseURL,
      url: `sentence-transformers/all-mpnet-base-v2`,
      method: 'POST',
      data: {
        inputs: body,
      },
      headers: {
        Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
      },
    });

    return response.data;
  }
}
