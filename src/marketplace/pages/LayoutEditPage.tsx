import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import LayoutForm from '../components/LayoutForm';
import {
  createLayout,
  updateLayout,
  getUserGeneratedLayouts,
} from '../../api/layouts';
import { UserGeneratedLayout } from '../../types/layout';

const LayoutEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<UserGeneratedLayout | null>(null);

  useEffect(() => {
    if (id) {
      const fetchLayout = async () => {
        try {
          const layouts = await getUserGeneratedLayouts();
          const layout = layouts.find((l) => l.id === id);
          if (layout) {
            setInitialData(layout);
          } else {
            setError('Layout not found');
          }
        } catch (err) {
          setError('Failed to load layout');
          console.error('Error fetching layout:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchLayout();
    }
  }, [id]);

  const handleSubmit = async (
    layout: Omit<UserGeneratedLayout, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      setLoading(true);
      if (id) {
        await updateLayout(id, layout);
      } else {
        await createLayout(layout);
      }
      navigate('/marketplace/layouts');
    } catch (err) {
      setError('Failed to save layout');
      console.error('Error saving layout:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/marketplace/layouts');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {id ? 'Edit Layout' : 'Create New Layout'}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {id
          ? 'Update your layout details and settings'
          : 'Create a new layout for your venue'}
      </Typography>

      <LayoutForm
        initialData={initialData || undefined}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </Container>
  );
};

export default LayoutEditPage; 