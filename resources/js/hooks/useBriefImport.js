import axios from 'axios';
import { useState } from 'react';

export function useBriefImport() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const extractFromFile = async (file) => {
        setLoading(true);
        setError(null);
        try {
            const form = new FormData();
            form.append('file', file);
            const { data } = await axios.post('/api/briefs/import/file', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return data;
        } catch (e) {
            setError("Erreur lors de l'extraction. Vérifiez le fichier.");
            console.error(e);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { extractFromFile, loading, error };
}
