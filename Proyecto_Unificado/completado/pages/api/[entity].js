// BACKEND (no tocar): una API que lee y escribe data/db.json.
// Direcciones: /api/customers, /api/products, /api/orders
import fs from 'fs';                                   // modulo para leer/escribir ficheros
import path from 'path';                               // modulo para construir rutas de ficheros
import { getStore } from '@netlify/blobs';             // almacenamiento persistente cuando se publica en Netlify
import datosIniciales from '../../data/db.json';       // datos semilla incluidos en el despliegue

const FILE = path.join(process.cwd(), 'data', 'db.json'); // ruta del fichero de datos
const ENTITIES = ['customers', 'products', 'orders'];  // listas permitidas
const EN_NETLIFY = process.env.NETLIFY === 'true';
const load = async () => {
  if (EN_NETLIFY) {
    const store = getStore('proyecto-unificado-db');
    let db = await store.get('db', { type: 'json' });
    if (db) return db;
    // Inicializa el almacen una sola vez con los datos empaquetados.
    await store.setJSON('db', datosIniciales, { onlyIfNew: true });
    db = await store.get('db', { type: 'json' });
    return db || datosIniciales;
  }
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
};
const save = async (db) => {
  if (EN_NETLIFY) {
    await getStore('proyecto-unificado-db').setJSON('db', db);
    return;
  }
  // Escribe primero un temporal para que una interrupcion no deje db.json a medias.
  const temporal = `${FILE}.${process.pid}.tmp`;
  fs.writeFileSync(temporal, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(temporal, FILE);
};

export default async function handler(req, res) {       // funcion que atiende cada peticion
  const { entity, id } = req.query;                    // de la direccion: que lista y (opcional) que id
  if (!ENTITIES.includes(entity)) return res.status(404).json({ error: 'Lista desconocida' }); // lista no valida
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method)) return res.status(405).end();

  try {
    const db = await load();                           // cargamos todos los datos
    const list = db[entity];                           // la lista pedida
    if (!Array.isArray(list)) return res.status(500).json({ error: `La lista ${entity} no existe o esta danada en data/db.json.` });
    if (req.method === 'GET') return res.json(list);   // GET = leer: devolvemos la lista
    if (req.method === 'POST') {                       // POST = crear
      if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) return res.status(400).json({ error: 'El cuerpo de la peticion debe ser un objeto JSON.' });
      const nuevoId = list.reduce((m, x) => Math.max(m, x.id), 0) + 1; // siguiente id libre
      const item = { ...req.body, id: nuevoId };       // elemento nuevo con su id
      list.push(item);                                 // lo anadimos
      await save(db);                                  // guardamos
      return res.status(201).json(item);               // respondemos con lo creado
    }
    const idx = list.findIndex((x) => x.id == id);     // para PUT/DELETE: posicion del elemento
    if (idx < 0) return res.status(404).json({ error: 'No existe' }); // no encontrado
    if (req.method === 'PUT') {                        // PUT = modificar
      if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) return res.status(400).json({ error: 'El cuerpo de la peticion debe ser un objeto JSON.' });
      list[idx] = { ...list[idx], ...req.body, id: list[idx].id }; // mezclamos datos nuevos
      await save(db);                                  // guardamos
      return res.json(list[idx]);                      // devolvemos el elemento modificado
    }
    list.splice(idx, 1);                               // DELETE: quitamos el elemento
    await save(db);                                    // guardamos
    return res.json({ ok: true });                     // confirmamos
  } catch (error) {
    console.error('Error en la API /api/' + entity + ':', error);
    return res.status(500).json({ error: 'Error interno de la API', detalle: error.message });
  }
}
