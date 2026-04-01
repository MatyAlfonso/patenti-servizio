import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { Richiesta, Persona, Ente, StatoRichiesta, TipoRichiesta, Allegato, PatenteCivile, PatenteServizio, sequelize } from '../models/index.js';
import { generateLicenseBuffer } from '../services/pdfGenerator.js';

export const getAll = async () => {
    return await Richiesta.findAll({
        include: [
            { model: Persona, as: 'persona', include: [{ model: PatenteCivile, as: 'patente_civile' }] },
            { model: Ente, as: 'ente' },
            { model: StatoRichiesta, as: 'stato' },
            { model: TipoRichiesta, as: 'tipo' },
            { model: Allegato, as: 'fototessera' },
            { model: Allegato, as: 'firma_scansionata' }
        ],
        order: [['createdAt', 'DESC']]
    });
};

export const create = async (data, files) => {
    const transaction = await sequelize.transaction();
    try {
        const {
            id_persona, id_ente, id_tipo, id_stato, residenza_persona, note_richiedente,
            patente_civile_numero, patente_civile_categorie, patente_civile_autorita,
            patente_civile_rilascio, patente_civile_scadenza
        } = data;

        const existingRequest = await Richiesta.findOne({
            where: {
                id_persona,
                id_stato: ['IN_PREPARAZIONE']
            },
            transaction
        });
        if (existingRequest) throw new Error("Esiste già una richiesta in corso per questa persona.");

        const currentActiveLicense = await PatenteCivile.findOne({
            where: { id_persona, id_stato: 'ATTIVA' },
            transaction
        });

        if (id_tipo === 'NUOVA' && currentActiveLicense) throw new Error("La persona ha già una patente attiva. Usa 'Rinnovo'.");
        if (id_tipo === 'RINNOVO' && !currentActiveLicense) throw new Error("Impossibile rinnovare: nessuna patente attiva trovata.");

        if (id_tipo === 'RINNOVO' && currentActiveLicense) {
            await currentActiveLicense.update({ id_stato: 'SCADUTA' }, { transaction });
        }

        await PatenteCivile.create({
            id_persona,
            numero: patente_civile_numero.toUpperCase(),
            data_rilascio: patente_civile_rilascio,
            data_scadenza: patente_civile_scadenza,
            id_categoria: patente_civile_categorie,
            id_stato: 'ATTIVA',
            autorita: patente_civile_autorita.toUpperCase()
        }, { transaction });

        const entity = await Ente.findByPk(id_ente, { transaction });
        if (!entity) throw new Error("Ente non trovato");

        const newSequence = (entity.sq_richieste || 0) + 1;
        await entity.update({ sq_richieste: newSequence }, { transaction });

        const uploadDir = path.join(app.getPath('userData'), 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        let photoId = null;
        let signatureId = null;

        if (files?.fototessera?.data) {
            const fileName = `foto_${Date.now()}_${files.fototessera.name}`;
            const filePath = path.join(uploadDir, fileName);

            fs.writeFileSync(filePath, files.fototessera.data);

            const photo = await Allegato.create({
                nome_file: files.fototessera.name,
                path: filePath,
                data_inserimento: new Date()
            }, { transaction });
            photoId = photo.id;
        }

        if (files?.firma?.data) {
            const fileName = `firma_${Date.now()}_${files.firma.name}`;
            const filePath = path.join(uploadDir, fileName);

            fs.writeFileSync(filePath, files.firma.data);

            const signature = await Allegato.create({
                nome_file: files.firma.name,
                path: filePath,
                data_inserimento: new Date()
            }, { transaction });
            signatureId = signature.id;
        }

        const newRequest = await Richiesta.create({
            data_richiesta: new Date(),
            id_persona,
            id_ente,
            id_tipo,
            id_stato,
            residenza_persona: residenza_persona.toUpperCase(),
            note_richiedente,
            id_foto: photoId,
            id_firma: signatureId,
            numero_richiesta_ente: newSequence
        }, { transaction });

        await transaction.commit();
        return JSON.parse(JSON.stringify(newRequest));

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("Controller Error:", error);
        throw error;
    }
};

export const update = async (id, data, files) => {
    const transaction = await sequelize.transaction();
    try {
        const request = await Richiesta.findByPk(id, {
            include: ['fototessera', 'firma_scansionata'],
            transaction
        });

        if (!request) {
            throw new Error("Richiesta non trovata");
        }

        if (data.id_tipo && data.id_tipo !== request.id_tipo) {
            const activeLicense = await PatenteCivile.findOne({
                where: { id_persona: request.id_persona, id_stato: 'ATTIVA' },
                transaction
            });
            if (data.id_tipo === 'NUOVA' && activeLicense) {
                throw new Error("Non puoi cambiare in 'Nuova': esiste già una patente attiva.");
            }
        }

        await request.update({
            id_ente: data.id_ente || request.id_ente,
            id_tipo: data.id_tipo || request.id_tipo,
            id_stato: data.id_stato || request.id_stato,
            residenza_persona: data.residenza_persona ? data.residenza_persona.toUpperCase() : request.residenza_persona,
            note_richiedente: data.note_richiedente || request.note_richiedente
        }, { transaction });

        const uploadDir = path.join(app.getPath('userData'), 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        if (files?.fototessera?.data) {
            const fileName = `foto_${Date.now()}_${files.fototessera.name}`;
            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, files.fototessera.data);

            const f = await Allegato.create({
                nome_file: files.fototessera.name,
                path: filePath,
                data_inserimento: new Date()
            }, { transaction });
            await request.update({ id_foto: f.id }, { transaction });
        }

        if (files?.firma?.data) {
            const fileName = `firma_${Date.now()}_${files.firma.name}`;
            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, files.firma.data);

            const s = await Allegato.create({
                nome_file: files.firma.name,
                path: filePath,
                data_inserimento: new Date()
            }, { transaction });
            await request.update({ id_firma: s.id }, { transaction });
        }

        if (data.patente_civile_numero) {
            const civilLicense = await PatenteCivile.findOne({
                where: {
                    id_persona: request.id_persona,
                    id_stato: 'ATTIVA'
                },
                transaction
            });

            if (civilLicense) {
                await civilLicense.update({
                    numero: data.patente_civile_numero.toUpperCase(),
                    id_categoria: data.patente_civile_categorie || civilLicense.id_categoria,
                    autorita: data.patente_civile_autorita ? data.patente_civile_autorita.toUpperCase() : civilLicense.autorita,
                    data_rilascio: data.patente_civile_rilascio || civilLicense.data_rilascio,
                    data_scadenza: data.patente_civile_scadenza || civilLicense.data_scadenza
                }, { transaction });
            }
        }

        await transaction.commit();
        await request.reload({ include: ['fototessera', 'firma_scansionata', 'persona'] });
        return JSON.parse(JSON.stringify(request));
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error("Update Error:", error);
        throw error;
    }
};

export const generatePDF = async (id) => {
    const request = await Richiesta.findByPk(id);
    if (!request) throw new Error("Richiesta non trovata");

    const serviceLicense = await PatenteServizio.findOne({
        where: {
            id_persona: request.id_persona,
            id_ente: request.id_ente,
            id_foto: request.id_foto,
            id_firma: request.id_firma,
            id_stato: 'ATTIVA'
        },
        include: [
            {
                model: Persona,
                as: 'persona',
                include: [{ model: PatenteCivile, as: 'patente_civile' }]
            },
            { model: Allegato, as: 'fototessera' },
            { model: Allegato, as: 'firma_scansionata' }
        ]
    });

    if (!serviceLicense) throw new Error("Patente non emessa per questa richiesta");

    return await generateLicenseBuffer(serviceLicense);
};

export const remove = async (id) => {
    const request = await Richiesta.findByPk(id);
    if (!request) throw new Error("Richiesta non trovata");
    await request.destroy();
    return { success: true };
};