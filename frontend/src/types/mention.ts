import { MentionData } from '@draft-js-plugins/mention';

export interface IMention extends MentionData {
  // link?: string;
  // avatar?: string;
  // name: string;
  // id?: null | string | number;
  // [x: string]: any;
  description?: string;
  type?: string;
}
