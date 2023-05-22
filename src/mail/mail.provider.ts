import { User } from 'src/Model/user.entity';
import { EMAIL_REPOSITORY } from '../core/constants';

export const userProviders = [
    {
        provide: EMAIL_REPOSITORY,
    },
];
