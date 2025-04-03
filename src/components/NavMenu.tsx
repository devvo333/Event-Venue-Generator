import ViewInArIcon from '@mui/icons-material/ViewInAr';
import VrpanoIcon from '@mui/icons-material/VrpanoRounded';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CategoryIcon from '@mui/icons-material/Category';

// Add AR/VR section to the menu items array
const menuItems = [
  // ... existing items ...
  
  // AR/VR section
  {
    title: 'AR/VR Tools',
    icon: <ViewInArIcon />,
    items: [
      {
        name: 'AR/VR Demo',
        path: '/ar-demo',
        icon: <VrpanoIcon />,
        description: 'Interactive AR/VR experience showcase'
      },
      {
        name: 'Virtual Walkthrough',
        path: '/virtual-walkthrough',
        icon: <DirectionsWalkIcon />,
        description: 'Explore venues in first-person view'
      }
    ]
  },
  
  // Marketplace section
  {
    title: 'Marketplace',
    icon: <StorefrontIcon />,
    items: [
      {
        name: 'Browse Assets',
        path: '/marketplace',
        icon: <StorefrontIcon />,
        description: 'Explore and purchase assets for your venues'
      },
      {
        name: 'Venue Showcase',
        path: '/marketplace/venues',
        icon: <StorefrontIcon />,
        description: 'Browse and discover venues for your events'
      },
      {
        name: 'Asset Categories',
        path: '/marketplace/categories',
        icon: <CategoryIcon />,
        description: 'Browse assets by category'
      },
      {
        name: 'My Purchases',
        path: '/marketplace/purchases',
        icon: <ShoppingCartIcon />,
        description: 'View your purchased assets'
      }
    ]
  },
  
  // Keep existing items after this
]; 