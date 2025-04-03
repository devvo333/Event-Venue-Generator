import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Avatar,
    Rating,
    Chip,
    Divider,
    Button,
    Card,
    CardContent,
    CardMedia,
    IconButton,
    useTheme
} from '@mui/material';
import {
    LocationOn,
    Work,
    Star,
    Share,
    Favorite,
    Message
} from '@mui/icons-material';
import { DesignerProfileWithDetails } from '../types/designer';
import { useNavigate } from 'react-router-dom';

interface DesignerProfileProps {
    designer: DesignerProfileWithDetails;
}

export const DesignerProfile: React.FC<DesignerProfileProps> = ({ designer }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const handleContact = () => {
        // TODO: Implement contact functionality
        console.log('Contact designer:', designer.id);
    };

    const handleShare = () => {
        // TODO: Implement share functionality
        console.log('Share designer profile:', designer.id);
    };

    return (
        <Box sx={{ py: 4 }}>
            <Paper sx={{ p: 4, mb: 4 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Avatar
                                src={designer.profileImageUrl}
                                sx={{ width: 200, height: 200, mb: 2 }}
                            />
                            {designer.isVerified && (
                                <Chip
                                    icon={<Star />}
                                    label="Verified Designer"
                                    color="primary"
                                    sx={{ mb: 2 }}
                                />
                            )}
                            <Typography variant="h5" component="h1" gutterBottom>
                                {designer.displayName}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                {designer.location}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Rating value={designer.rating} precision={0.5} readOnly />
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                    ({designer.reviewCount} reviews)
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                <Button
                                    variant="contained"
                                    startIcon={<Message />}
                                    onClick={handleContact}
                                >
                                    Contact
                                </Button>
                                <IconButton onClick={handleShare}>
                                    <Share />
                                </IconButton>
                                <IconButton>
                                    <Favorite />
                                </IconButton>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Typography variant="h6" gutterBottom>
                            About
                        </Typography>
                        <Typography paragraph>
                            {designer.bio}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            Experience
                        </Typography>
                        <Typography paragraph>
                            {designer.yearsOfExperience} years of experience
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            Specialties
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {designer.specialties.map((specialty) => (
                                <Chip key={specialty} label={specialty} />
                            ))}
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            Services
                        </Typography>
                        <Grid container spacing={2}>
                            {designer.services.map((service) => (
                                <Grid item xs={12} sm={6} key={service.id}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                {service.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" paragraph>
                                                {service.description}
                                            </Typography>
                                            <Typography variant="h6" color="primary">
                                                ${service.price}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>

            <Typography variant="h5" gutterBottom>
                Portfolio
            </Typography>
            <Grid container spacing={3}>
                {designer.portfolioItems.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <Card>
                            <CardMedia
                                component="img"
                                height="200"
                                image={item.imageUrls[0]}
                                alt={item.title}
                            />
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {item.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {item.description}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Typography variant="h5" sx={{ mt: 4 }} gutterBottom>
                Reviews
            </Typography>
            <Grid container spacing={3}>
                {designer.reviews.map((review) => (
                    <Grid item xs={12} key={review.id}>
                        <Paper sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar src={review.reviewerAvatar} sx={{ mr: 2 }} />
                                <Box>
                                    <Typography variant="subtitle1">
                                        {review.reviewerName}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Rating value={review.rating} readOnly size="small" />
                                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Typography paragraph>
                                {review.comment}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}; 