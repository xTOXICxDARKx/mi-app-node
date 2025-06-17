const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';

const client = new MongoClient(MONGO_URI);
let db;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

async function conectarDB() {
  try {
    await client.connect();
    db = client.db('Escuela');
    console.log('✅ Conectado a MongoDB');
  } catch (err) {
    console.error('❌ Error al conectar a MongoDB:', err);
  }
}

// VISUALIZAR TODOS LOS ALUMNOS
app.get('/visualizar', async (req, res) => {
  try {
    const alumnos = await db.collection('Alumno').find().toArray();

    let html = `
      <html>
        <head>
          <style>
            table { border-collapse: collapse; width: 90%; margin: 20px auto; }
            th, td { border: 1px solid black; padding: 8px; text-align: center; }
            th { background-color: #4CAF50; color: white; }
          </style>
        </head>
        <body>
          <h2 style="text-align:center;">Lista de Alumnos</h2>
          <table>
            <tr>
              <th>No. Control</th>
              <th>Nombre</th>
              <th>Carrera</th>
              <th>Semestre</th>
              <th>Correo</th>
              <th>Edad</th>
              <th>Generación</th>
            </tr>`;

    alumnos.forEach(alumno => {
      html += `
        <tr>
          <td>${alumno.no_control || ''}</td>
          <td>${alumno.nombre || ''}</td>
          <td>${alumno.carrera || ''}</td>
          <td>${alumno.semestre || ''}</td>
          <td>${alumno.correo || ''}</td>
          <td>${alumno.edad || ''}</td>
          <td>${alumno.generacion || ''}</td>
        </tr>`;
    });

    html += `
          </table>
          <div style="text-align:center; margin-top:20px;">
            <a href="/index.html">← Volver al Menú</a>
          </div>
        </body>
      </html>`;

    res.send(html);

  } catch (error) {
    res.status(500).send('Error al obtener los alumnos');
  }
});

// ALTA
app.post('/alta', async (req, res) => {
  try {
    await db.collection('Alumno').insertOne(req.body);
    res.redirect('/visualizar');
  } catch (error) {
    res.status(500).send('Error al dar de alta');
  }
});

// BAJA
app.post('/baja', async (req, res) => {
  const { no_control } = req.body;
  try {
    await db.collection('Alumno').deleteOne({ no_control });
    res.redirect('/visualizar');
  } catch (error) {
    res.status(500).send('Error al dar de baja');
  }
});

// ACTUALIZAR
app.post('/actualizar', async (req, res) => {
  const { no_control, campo, nuevo_valor } = req.body;
  try {
    const updateData = { $set: { [campo]: isNaN(nuevo_valor) ? nuevo_valor : parseInt(nuevo_valor) } };
    await db.collection('Alumno').updateOne({ no_control }, updateData);
    res.redirect('/visualizar');
  } catch (error) {
    res.status(500).send('Error al actualizar');
  }
});

// Iniciar servidor después de conectar
conectarDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🟢 Servidor corriendo en http://localhost:${PORT}`);
  });
});

