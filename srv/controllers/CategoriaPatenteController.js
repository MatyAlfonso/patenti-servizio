import { CategoriaPatente } from '../models/index.js';

export const getAll = async () => {
    return await CategoriaPatente.findAll();
};