import {
  createRequires,
  createUseRemoteComponent,
} from '@paciolan/remote-component';
import { resolve } from './remote-component.config';

const requires = createRequires(resolve);

// eslint-disable-next-line import/prefer-default-export
export const useRemoteComponent = createUseRemoteComponent({ requires });
