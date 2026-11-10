import express from 'express';
import dotenv from 'dotenv';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(currentDirectory, '.env') });

const app = express();
const port = process.env.PORT || 3000;
const clientBuildDirectory = path.resolve(currentDirectory, '../client/dist');
const tasks = [];

app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.get('/api/tasks', (_request, response) => {
  response.json(tasks);
});

app.post('/api/tasks', (request, response) => {
  const title =
    typeof request.body?.title === 'string' ? request.body.title.trim() : '';

  if (!title) {
    return response.status(400).json({ error: 'Task title is required.' });
  }

  if (title.length > 200) {
    return response
      .status(400)
      .json({ error: 'Task title must be 200 characters or fewer.' });
  }

  const task = { id: randomUUID(), title };
  tasks.push(task);
  return response.status(201).json(task);
});

if (existsSync(clientBuildDirectory)) {
  app.use(express.static(clientBuildDirectory));
  app.get('*', (_request, response) => {
    response.sendFile(path.join(clientBuildDirectory, 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Task app server listening on port ${port}`);
});
