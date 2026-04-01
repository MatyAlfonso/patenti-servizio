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
    try {
        const dataToCreate = {
            ...data,
            cognome: data.cognome.toUpperCase(),
            nome: data.nome.toUpperCase(),
            codice_fiscale: data.codice_fiscale.toUpperCase(),
            luogo_nascita: data.luogo_nascita.toUpperCase(),
        };

        return await Persona.create(dataToCreate);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new Error(`La persona con Codice Fiscale ${data.codice_fiscale.toUpperCase()} è già registrata.`);
        }
        if (error.name === 'SequelizeValidationError') {
            throw new Error("Dati non validi. Controlla i campi inseriti.");
        }
        throw error;
    }
};

export const update = async (id, data) => {
    const person = await Persona.findByPk(id);
    if (!person) throw new Error("Persona non trovata");

    try {
        const dataToUpdate = { ...data };
        if (dataToUpdate.cognome) dataToUpdate.cognome = dataToUpdate.cognome.toUpperCase();
        if (dataToUpdate.nome) dataToUpdate.nome = dataToUpdate.nome.toUpperCase();
        if (dataToUpdate.codice_fiscale) dataToUpdate.codice_fiscale = dataToUpdate.codice_fiscale.toUpperCase();
        if (dataToUpdate.luogo_nascita) dataToUpdate.luogo_nascita = dataToUpdate.luogo_nascita.toUpperCase();

        return await person.update(dataToUpdate);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new Error("Il Codice Fiscale inserito appartiene già a un'altra persona.");
        }
        throw error;
    }
};

export const remove = async (id) => {
    const person = await Persona.findByPk(id);
    
    if (!person) throw new Error("Persona non trovata");

    await person.destroy();

    return { success: true };
};