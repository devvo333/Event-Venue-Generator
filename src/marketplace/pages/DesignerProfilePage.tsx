import React, { useState, useEffect } from 'react';
import { Container, CircularProgress, Alert } from '@mui/material';
import { useParams } from 'react-router-dom';
import { DesignerProfile } from '../components/DesignerProfile';
import { designerService } from '../services/designerService';
import { DesignerProfileWithDetails } from '../types/designer';

export const DesignerProfilePage: React.FC = () => {
    const { designerId } = useParams<{ designerId: string }>();
    const [designer, setDesigner] = useState<DesignerProfileWithDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDesignerProfile = async () => {
            if (!designerId) return;
            
            setLoading(true);
            setError(null);
            
            try {
                const profile = await designerService.getDesignerProfileWithDetails(designerId);
                setDesigner(profile);
            } catch (err) {
                setError('Failed to load designer profile. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDesignerProfile();
    }, [designerId]);

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ py: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!designer) {
        return (
            <Container sx={{ py: 4 }}>
                <Alert severity="warning">Designer profile not found.</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <DesignerProfile designer={designer} />
        </Container>
    );
}; 