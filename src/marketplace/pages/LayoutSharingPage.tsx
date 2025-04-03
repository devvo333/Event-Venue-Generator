import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import LayoutTemplates from '../components/LayoutTemplates';
import UserGeneratedLayouts from '../components/UserGeneratedLayouts';
import LayoutMarketplace from '../components/LayoutMarketplace';
import {
  LayoutTemplate,
  UserGeneratedLayout,
  LayoutMarketplaceItem,
  LayoutSearchFilters,
} from '../../types/layout';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`layout-tabpanel-${index}`}
      aria-labelledby={`layout-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const LayoutSharingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [templates, setTemplates] = useState<LayoutTemplate[]>([]);
  const [userLayouts, setUserLayouts] = useState<UserGeneratedLayout[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<LayoutMarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API calls
        const templatesResponse = await fetch('/api/layouts/templates');
        const userLayoutsResponse = await fetch('/api/layouts/user-generated');
        const marketplaceResponse = await fetch('/api/layouts/marketplace');

        const [templatesData, userLayoutsData, marketplaceData] = await Promise.all([
          templatesResponse.json(),
          userLayoutsResponse.json(),
          marketplaceResponse.json(),
        ]);

        setTemplates(templatesData);
        setUserLayouts(userLayoutsData);
        setMarketplaceItems(marketplaceData);
      } catch (err) {
        setError('Failed to load layouts. Please try again later.');
        console.error('Error fetching layouts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleUseTemplate = (template: LayoutTemplate) => {
    // TODO: Implement template usage logic
    console.log('Using template:', template);
  };

  const handleUseLayout = (layout: UserGeneratedLayout) => {
    // TODO: Implement layout usage logic
    console.log('Using layout:', layout);
  };

  const handlePurchase = (item: LayoutMarketplaceItem) => {
    // TODO: Implement purchase logic
    console.log('Purchasing item:', item);
  };

  const handleLike = (id: string) => {
    // TODO: Implement like logic
    console.log('Liking item:', id);
  };

  const handleShare = (id: string) => {
    // TODO: Implement share logic
    console.log('Sharing item:', id);
  };

  const handleSearch = (filters: LayoutSearchFilters) => {
    // TODO: Implement search logic
    console.log('Searching with filters:', filters);
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
        Layout Sharing
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Browse, share, and purchase venue layouts created by our community.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Templates" />
          <Tab label="Community Layouts" />
          <Tab label="Marketplace" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <LayoutTemplates
          templates={templates}
          onUseTemplate={handleUseTemplate}
          onLike={handleLike}
          onShare={handleShare}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <UserGeneratedLayouts
          layouts={userLayouts}
          onUseLayout={handleUseLayout}
          onLike={handleLike}
          onShare={handleShare}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <LayoutMarketplace
          items={marketplaceItems}
          onPurchase={handlePurchase}
          onLike={handleLike}
          onShare={handleShare}
          onSearch={handleSearch}
        />
      </TabPanel>
    </Container>
  );
};

export default LayoutSharingPage; 