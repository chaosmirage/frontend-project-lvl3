import { fileURLToPath } from 'url';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (filename: string) => path.join(__dirname, '..', filename);
