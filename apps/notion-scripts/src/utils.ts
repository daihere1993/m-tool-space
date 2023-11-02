import { Client } from '@notionhq/client';

export default {
  async getPagesFromDatabase(notion: Client, database_id: string, filter?, sorts?) {
    let next_cursor;
    let has_more = true;
    let selected_pages = [];
    while (has_more) {
      const response = await notion.databases.query({ database_id, filter, sorts, start_cursor: next_cursor});
      has_more = response.has_more;
      next_cursor = response.next_cursor;
      selected_pages = selected_pages.concat(response.results)
    }
    return selected_pages;
  },
  getPageTitle(page): string {
    return page.properties['Name'].title[0].plain_text;
  }
}