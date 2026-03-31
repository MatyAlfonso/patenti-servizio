import { PatenteCivile, Persona, CategoriaPatente, StatoPatente, PatenteServizio, sequelize } from '../models/index.js';

export const getAll = async () => {
    return await PatenteCivile.findAll({
        include: [
            { model: Persona, as: 'persona' },
            { model: CategoriaPatente, as: 'categoria' },
            { model: StatoPatente, as: 'stato' }
        ],
        order: [['data_scadenza', 'ASC']]
    });
};

export const create = async (data) => {
    const transaction = await sequelize.transaction();
    try {
        const { id_persona, numero, id_categoria, autorita, data_rilascio, data_scadenza } = data;

        const existingActive = await PatenteCivile.findOne({
            where: { id_persona, id_stato: 'ATTIVA' },
            transaction
        });

        if (existingActive) {
            throw new Error("Questa persona ha già una patente civile attiva nel sistema.");
        }

        const newLicense = await PatenteCivile.create({
            id_persona,
            numero: numero.toUpperCase(),
            id_categoria,
            autorita: autorita.toUpperCase(),
            data_rilascio,
            data_scadenza,
            id_stato: 'ATTIVA'
        }, { transaction });

        await transaction.commit();
        return await PatenteCivile.findByPk(newLicense.id, {
            include: ['persona', 'categoria', 'stato']
        });
    } catch (error) {
        if (transaction) await transaction.rollback();
        throw error;
    }
};

export const update = async (id, id_stato) => {
    const transaction = await sequelize.transaction();
    try {
        const patenteCivile = await PatenteCivile.findByPk(id);
        if (!patenteCivile) throw new Error("Patente civile non trovata");

        await patenteCivile.update({ id_stato }, { transaction });

        if (id_stato !== 'ATTIVA') {
            await PatenteServizio.update(
                {
                    id_stato,
                    note: `Inabilitata automaticamente: patente civile in stato ${id_stato}`
                },
                {
                    where: { id_persona: patenteCivile.id_persona, id_stato: 'ATTIVA' },
                    transaction
                }
            );
        }

        await transaction.commit();
        return { success: true };
    } catch (error) {
        if (transaction) await transaction.rollback();
        throw error;
    }
};