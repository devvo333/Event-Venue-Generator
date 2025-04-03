import React, { useState, useEffect } from 'react';
import { Container, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { DesignerProfileForm } from '../components/DesignerProfileForm';
import { designerService } from '../services/designerService';
import { DesignerProfile } from '../types/designer';

export const DesignerProfileEditPage: React.FC = () => {
    const { designerId } = useParams<{ designerId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [initialData, setInitialData] = useState<DesignerProfile | null>(null);

    useEffect(() => {
        const fetchDesignerProfile = async () => {
            if (!designerId) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const profile = await designerService.getDesignerProfile(designerId);
                setInitialData(profile);
            } catch (err) {
                setError('Failed to load designer profile. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDesignerProfile();
    }, [designerId]);

    const handleSubmit = async (data: Partial<DesignerProfile>) => {
        setLoading(true);
        setError(null);

        try {
            if (designerId) {
                await designerService.updateDesignerProfile({
                    ...data,
                    id: designerId,
                    userId: initialData?.userId || '' // Ensure userId is preserved
                });
            } else {
                // For new profiles, ensure required fields are present
                const newProfile = {
                    ...data,
                    userId: '', // This should be set by the service based on the current user
                    displayName: data.displayName || '',
                    bio: data.bio || '',
                    location: data.location || '',
                    profileImageUrl: data.profileImageUrl || '',
                    specialties: data.specialties || [],
                    eventTypes: data.eventTypes || [],
                    yearsOfExperience: data.yearsOfExperience || 0,
                    isVerified: false,
                    rating: 0,
                    reviewCount: 0
                };
                await designerService.createDesignerProfile(newProfile);
            }
            navigate('/marketplace/designers');
        } catch (err) {
            setError('Failed to save profile. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !initialData) {
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

    return (
        <Container maxWidth="lg">
            <DesignerProfileForm
                initialData={initialData || undefined}
                onSubmit={handleSubmit}
            />
        </Container>
    );
}; 