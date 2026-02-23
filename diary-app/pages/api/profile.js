import { getProfile, setProfileBulk } from '../../lib/memory-store';

export default function handler(req, res) {
    if (req.method === 'GET') {
        return res.status(200).json(getProfile());
    }
    if (req.method === 'POST') {
        const profile = setProfileBulk(req.body);
        return res.status(200).json(profile);
    }
    res.status(405).end();
}
