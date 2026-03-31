import { Ente } from '../models/index.js';

export const getAll = async () => {
    return await Ente.findAll();
};

export const create = async (data) => {
    const dataToCreate = {
        ...data,
        id: data.id.toUpperCase(),
        descrizione: data.descrizione.toUpperCase(),
        sq_richieste: 0,
        sq_patenti: 0
    };

    return await Ente.create(dataToCreate);
};

export const update = async (id, data) => {
    const entity = await Ente.findByPk(id);

    if (!entity) throw new Error("Ente non trovato");

    return await entity.update({ descrizione: data.descrizione });
};

export const remove = async (id) => {
    const entity = await Ente.findByPk(id);

    if (!entity) throw new Error("Ente non trovato");

    await entity.destroy();

    return { message: "Ente eliminato correctamente" };
};