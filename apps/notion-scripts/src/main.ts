/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';
import dotenv from 'dotenv';
import utils from './utils';
import { Client } from '@notionhq/client/';
import { ProxyAgent } from 'proxy-agent';

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(express.json());

const agent = new ProxyAgent();
const notion = new Client({ auth: process.env.NOTION_KEY, agent });

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to notion-scripts!' });
});

app.post('/update_archived_data_for_nokia_tasks', async (req, res) => {
  try {
    console.log('start to handling /update_archived_data_for_nokia_tasks');
    const databaseId = req.body.databaseId;
    const nokiaProjectId = req.body.projectId;
    const filter = {
      property: 'Project',
      relation: { contains: nokiaProjectId },
    };
    const sorts = [{ property: 'Created Date', direction: 'descending' }];

    const tasks = await utils.getPagesFromDatabase(notion, databaseId, filter, sorts);

    for (const task of tasks) {
      const cloasedDate = task.properties['Closed Date'].date;
      const archivedDate = task.properties['Archived Date'].date;
      if (cloasedDate && !archivedDate) {
        console.log('Modifying archivedDate for page ' + utils.getPageTitle(task));
        await notion.pages.update({
          page_id: task.id,
          properties: {
            'Archived Date': {
              date: cloasedDate,
            },
          },
        });
      }
    }

    res.json({ message: 'success' });
  } catch (error) {
    res.json({ message: 'error', error });
  }
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);
