import React from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Chip,
    Rating,
    Avatar,
    Link
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DesignerProfile } from '../types/designer';

interface DesignerCardProps {
    designer: DesignerProfile;
}

export const DesignerCard: React.FC<DesignerCardProps> = ({ designer }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/marketplace/designers/${designer.id}`);
    };

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                }
            }}
            onClick={handleClick}
        >
            <Box sx={{ position: 'relative', height: 200 }}>
                {designer.profileImageUrl ? (
                    <CardMedia
                        component="img"
                        height="200"
                        image={designer.profileImageUrl}
                        alt={designer.displayName}
                    />
                ) : (
                    <Box
                        sx={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'grey.100'
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 100,
                                height: 100,
                                bgcolor: 'primary.main'
                            }}
                        >
                            {designer.displayName.charAt(0)}
                        </Avatar>
                    </Box>
                )}
                {designer.isVerified && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'white',
                            borderRadius: '50%',
                            p: 0.5
                        }}
                    >
                        <Box
                            component="img"
                            src="/verified-badge.svg"
                            alt="Verified"
                            sx={{ width: 24, height: 24 }}
                        />
                    </Box>
                )}
            </Box>
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="div" gutterBottom>
                    {designer.displayName}
                </Typography>
                {designer.rating && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating value={designer.rating} precision={0.5} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            ({designer.reviewCount} reviews)
                        </Typography>
                    </Box>
                )}
                {designer.bio && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                    >
                        {designer.bio}
                    </Typography>
                )}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {designer.specialties.map((specialty, index) => (
                        <Chip
                            key={index}
                            label={specialty}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                    ))}
                </Box>
                {designer.experienceYears && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {designer.experienceYears}+ years of experience
                    </Typography>
                )}
                {designer.portfolioUrl && (
                    <Link
                        href={designer.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        sx={{ mt: 1, display: 'block' }}
                    >
                        View Portfolio
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}; 