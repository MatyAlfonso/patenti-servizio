import { PatenteServizio, PatenteCivile, Persona, CategoriaPatente, StatoPatente, Richiesta, Ente, sequelize } from '../models/index.js';

export const getAll = async () => {
    return await PatenteServizio.findAll({
        include: [
            { model: Persona, as: 'persona' },
            { model: PatenteCivile, as: 'patente_civile' },
            { model: CategoriaPatente, as: 'categoria' },
            { model: StatoPatente, as: 'stato' }
        ],
        order: [['data_rilascio', 'DESC']]
    });
};

export const issue = async (idRichiesta) => {
    const transaction = await sequelize.transaction();
    try {
        const request = await Richiesta.findByPk(idRichiesta, {
            include: [
                {
                    model: Persona,
                    as: 'persona',
                    include: [{ model: PatenteCivile, as: 'patente_civile' }]
                }
            ],
            transaction
        });

        if (!request) throw new Error("Richiesta non trovata");
        if (request.id_stato === 'INVIATA') throw new Error("Richiesta già processata");

        const oldActiveLicense = await PatenteServizio.findOne({
            where: { id_persona: request.id_persona, id_ente: request.id_ente, id_stato: 'ATTIVA' },
            transaction
        });

        if (oldActiveLicense) {
            await oldActiveLicense.update({ id_stato: 'SCADUTA' }, { transaction });
        }

        const entity = await Ente.findByPk(request.id_ente, { transaction });
        
        const newSq = (entity.sq_patenti || 0) + 1;
        const formattedSq = newSq.toString().padStart(4, '0');
        const prefix = request.id_ente === 'PCR' ? 'PC' : 'CF';
        const fullLicenseNumber = `${prefix}${formattedSq}`;

        const civilLicense = request.persona.patente_civile.find(p => p.id_stato === 'ATTIVA')
            || request.persona.patente_civile[0];

        if (!civilLicense) throw new Error("Dati patente civile non trovati per questa persona");

        const newLicense = await PatenteServizio.create({
            id_persona: request.id_persona,
            id_ente: request.id_ente,
            id_categoria: request.id_categoria_richiesta || civilLicense.id_categoria,
            id_stato: 'ATTIVA',
            id_foto: request.id_foto,
            id_firma: request.id_firma,
            id_patentecivile: civilLicense.id,
            numero: fullLicenseNumber,
            data_rilascio: new Date(),
            data_scadenza: civilLicense.data_scadenza
        }, { transaction });

        await entity.update({ sq_patenti: newSq }, { transaction });
        await request.update({ id_stato: 'INVIATA' }, { transaction });

        await transaction.commit();
        return JSON.parse(JSON.stringify(newLicense));
    } catch (error) {
        if (transaction) await transaction.rollback();
        throw error;
    }
};

export const update = async (id, data) => {
    const transaction = await sequelize.transaction();
    try {
        const patente = await PatenteServizio.findByPk(id);
        if (!patente) throw new Error("Patente di servizio non trovata");

        await patente.update({
            id_stato: data.id_stato,
        }, { transaction });

        await transaction.commit();
        return JSON.parse(JSON.stringify(patente));
    } catch (error) {
        if (transaction) await transaction.rollback();
        throw error;
    }
};