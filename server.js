const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = 3000;

const uri = 'mongodb+srv://xTOXICxDARKx:715600toxic@cluster0.tne5sfn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const client = new MongoClient(uri);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// VISUALIZAR TODOS LOS ALUMNOS
app.get('/visualizar', async (req, res) => {
  try {
    await client.connect();
    const db = client.db('Escuela');
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
  } finally {
    await client.close();
  }
});

// ALTA DE ALUMNO
app.post('/alta', async (req, res) => {
  const datos = req.body;
  try {
    await client.connect();
    const db = client.db('Escuela');
    await db.collection('Alumno').insertOne(datos);
    res.redirect('/visualizar');
  } catch (error) {
    res.status(500).send('Error al dar de alta');
  } finally {
    await client.close();
  }
});

// BAJA DE ALUMNO
app.post('/baja', async (req, res) => {
  const { no_control } = req.body;
  try {
    await client.connect();
    const db = client.db('Escuela');
    await db.collection('Alumno').deleteOne({ no_control });
    res.redirect('/visualizar');
  } catch (error) {
    res.status(500).send('Error al dar de baja');
  } finally {
    await client.close();
  }
});

// ACTUALIZAR ALUMNO
app.post('/actualizar', async (req, res) => {
  const { no_control, campo, nuevo_valor } = req.body;
  try {
    await client.connect();
    const db = client.db('Escuela');
    const updateData = { $set: { [campo]: isNaN(nuevo_valor) ? nuevo_valor : parseInt(nuevo_valor) } };
    await db.collection('Alumno').updateOne({ no_control }, updateData);
    res.redirect('/visualizar');
  } catch (error) {
    res.status(500).send('Error al actualizar');
  } finally {
    await client.close();
  }
});

app.listen(PORT, () => {
  console.log(`🟢 Servidor corriendo en http://localhost:${PORT}`);
});

