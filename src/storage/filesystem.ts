import { registerAs } from '@nestjs/config';

export default registerAs('filesystem', () => ({
  default: 'tracks',
  disks: {
    tracks: {
      driver: 'local',
      basePath: `${process.env.BASE_PATH}/data-demo/`, // fully qualified path of the folder
      baseUrl: 'https://localhost:3001',
    },
  },
}));
