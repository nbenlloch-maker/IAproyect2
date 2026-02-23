import { getEntries } from '../../lib/memory-store';

export default function handler(req, res) {
    if (req.method === 'GET') {
        return res.status(200).json(getEntries());
    }
    res.status(405).end();
}
