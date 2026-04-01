import { TipoRichiesta } from '../models/index.js';

export const getAll = async () => {
    return await TipoRichiesta.findAll();
};