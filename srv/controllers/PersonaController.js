import { Persona, PatenteCivile } from '../models/index.js';

export const getAll = async () => {
    return await Persona.findAll({
        include: [{
            model: PatenteCivile,
            as: 'patente_civile',
            where: { id_stato: 'ATTIVA' },
            required: false
        }],
        order: [['cognome', 'ASC'], ['nome', 'ASC']]
    });
};

export const create = async (data) => {
    const dataToCreate = {
        ...data,
        cognome: data.cognome.toUpperCase(),
        nome: data.nome.toUpperCase(),
        codice_fiscale: data.codice_fiscale.toUpperCase(),
        luogo_nascita: data.luogo_nascita.toUpperCase(),
    };

    return await Persona.create(dataToCreate);
};

export const update = async (id, data) => {
    const person = await Persona.findByPk(id);
    if (!person) throw new Error("Persona non trovata");

    const dataToUpdate = { ...data };
    if (dataToUpdate.cognome) dataToUpdate.cognome = dataToUpdate.cognome.toUpperCase();
    if (dataToUpdate.nome) dataToUpdate.nome = dataToUpdate.nome.toUpperCase();
    if (dataToUpdate.codice_fiscale) dataToUpdate.codice_fiscale = dataToUpdate.codice_fiscale.toUpperCase();
    if (dataToUpdate.luogo_nascita) dataToUpdate.luogo_nascita = dataToUpdate.luogo_nascita.toUpperCase();

    return await person.update(dataToUpdate);
};

export const remove = async (id) => {
    const person = await Persona.findByPk(id);
    
    if (!person) throw new Error("Persona non trovata");

    await person.destroy();

    return { success: true };
};