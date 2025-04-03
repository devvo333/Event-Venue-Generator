import React, { useState } from 'react';
import { useUserPreferences } from './UserPreferencesContext';
import { useNavigate } from 'react-router-dom';

// Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ColorPicker } from '@/components/ui/color-picker';

const UserPreferencesPage: React.FC = () => {
  const navigate = useNavigate();
  const { preferences, updatePreference, resetPreferences, loading } = useUserPreferences();
  const [activeTab, setActiveTab] = useState<string>('canvas');

  const handleSwitchChange = (key: keyof typeof preferences) => (checked: boolean) => {
    updatePreference(key, checked);
  };

  const handleSliderChange = (key: keyof typeof preferences) => (value: number[]) => {
    updatePreference(key, value[0]);
  };

  const handleSelectChange = (key: keyof typeof preferences) => (value: string) => {
    updatePreference(key, value);
  };

  const handleInputChange = (key: keyof typeof preferences) => (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePreference(key, e.target.value);
  };

  const handleNumberInputChange = (key: keyof typeof preferences) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      updatePreference(key, value);
    }
  };

  const handleColorChange = (key: keyof typeof preferences) => (color: string) => {
    updatePreference(key, color);
  };

  // Handle reset preferences
  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all preferences to default?')) {
      await resetPreferences();
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading preferences...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Preferences</h1>
          <p className="text-muted-foreground">Customize your Event Venue Generator experience</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
          <Button variant="destructive" onClick={handleReset}>Reset to Default</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="canvas">Canvas</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Canvas Preferences */}
        <TabsContent value="canvas">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>General Canvas Settings</CardTitle>
                <CardDescription>
                  Customize how the canvas behaves and appears
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showGrid">Show Grid</Label>
                    <Switch
                      id="showGrid"
                      checked={preferences.showGrid}
                      onCheckedChange={handleSwitchChange('showGrid')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="snapToGrid">Snap to Grid</Label>
                    <Switch
                      id="snapToGrid"
                      checked={preferences.snapToGrid}
                      onCheckedChange={handleSwitchChange('snapToGrid')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showRulers">Show Rulers</Label>
                    <Switch
                      id="showRulers"
                      checked={preferences.showRulers}
                      onCheckedChange={handleSwitchChange('showRulers')}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label htmlFor="gridSize">Grid Size</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="gridSize"
                      min={5}
                      max={50}
                      step={5}
                      value={[preferences.defaultGridSize]}
                      onValueChange={handleSliderChange('defaultGridSize')}
                    />
                    <span className="w-12 text-center">{preferences.defaultGridSize}px</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="rulerUnit">Ruler Units</Label>
                  <Select
                    value={preferences.rulerUnit}
                    onValueChange={handleSelectChange('rulerUnit')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cm">Centimeters (cm)</SelectItem>
                      <SelectItem value="inches">Inches (in)</SelectItem>
                      <SelectItem value="pixels">Pixels (px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Auto-Save Settings</CardTitle>
                <CardDescription>
                  Configure how your work is automatically saved
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="autoSaveInterval">Auto-Save Interval (seconds)</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="autoSaveInterval"
                      min={0}
                      max={300}
                      step={30}
                      value={[preferences.autoSaveInterval]}
                      onValueChange={handleSliderChange('autoSaveInterval')}
                    />
                    <span className="w-12 text-center">
                      {preferences.autoSaveInterval === 0 ? 'Off' : `${preferences.autoSaveInterval}s`}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Set to 0 to disable auto-save
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appearance Preferences */}
        <TabsContent value="appearance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme Settings</CardTitle>
                <CardDescription>
                  Customize the look and feel of the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="darkMode">Dark Mode</Label>
                  <Switch
                    id="darkMode"
                    checked={preferences.darkMode}
                    onCheckedChange={handleSwitchChange('darkMode')}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <ColorPicker 
                        color={preferences.primaryColor} 
                        onChange={handleColorChange('primaryColor')} 
                      />
                    </div>
                    <Input
                      id="primaryColor"
                      value={preferences.primaryColor}
                      onChange={handleInputChange('primaryColor')}
                      className="w-28"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interface Settings</CardTitle>
                <CardDescription>
                  Configure how the user interface behaves
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sidebarCollapsed">Collapsed Sidebar by Default</Label>
                  <Switch
                    id="sidebarCollapsed"
                    checked={preferences.sidebarCollapsed}
                    onCheckedChange={handleSwitchChange('sidebarCollapsed')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="showLayerThumbnails">Show Layer Thumbnails</Label>
                  <Switch
                    id="showLayerThumbnails"
                    checked={preferences.showLayerThumbnails}
                    onCheckedChange={handleSwitchChange('showLayerThumbnails')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="showWelcomeTips">Show Welcome Tips</Label>
                  <Switch
                    id="showWelcomeTips"
                    checked={preferences.showWelcomeTips}
                    onCheckedChange={handleSwitchChange('showWelcomeTips')}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tool Preferences */}
        <TabsContent value="tools">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Drawing Tool Settings</CardTitle>
                <CardDescription>
                  Default settings for shape and drawing tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="strokeWidth">Default Stroke Width</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="strokeWidth"
                      min={1}
                      max={10}
                      step={1}
                      value={[preferences.defaultStrokeWidth]}
                      onValueChange={handleSliderChange('defaultStrokeWidth')}
                    />
                    <span className="w-12 text-center">{preferences.defaultStrokeWidth}px</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="strokeColor">Default Stroke Color</Label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <ColorPicker 
                        color={preferences.defaultStrokeColor} 
                        onChange={handleColorChange('defaultStrokeColor')} 
                      />
                    </div>
                    <Input
                      id="strokeColor"
                      value={preferences.defaultStrokeColor}
                      onChange={handleInputChange('defaultStrokeColor')}
                      className="w-28"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="fillColor">Default Fill Color</Label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <ColorPicker 
                        color={preferences.defaultFillColor} 
                        onChange={handleColorChange('defaultFillColor')} 
                      />
                    </div>
                    <Input
                      id="fillColor"
                      value={preferences.defaultFillColor}
                      onChange={handleInputChange('defaultFillColor')}
                      className="w-28"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Text Tool Settings</CardTitle>
                <CardDescription>
                  Default settings for text annotations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="fontFamily">Default Font</Label>
                  <Select
                    value={preferences.defaultFontFamily}
                    onValueChange={handleSelectChange('defaultFontFamily')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      <SelectItem value="Courier New">Courier New</SelectItem>
                      <SelectItem value="Georgia">Georgia</SelectItem>
                      <SelectItem value="Verdana">Verdana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="fontSize">Default Font Size</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="fontSize"
                      min={8}
                      max={72}
                      step={1}
                      value={[preferences.defaultFontSize]}
                      onValueChange={handleSliderChange('defaultFontSize')}
                    />
                    <span className="w-12 text-center">{preferences.defaultFontSize}px</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notification Preferences */}
        <TabsContent value="notifications">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Control how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <Switch
                    id="emailNotifications"
                    checked={preferences.emailNotifications}
                    onCheckedChange={handleSwitchChange('emailNotifications')}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications about important events
                </p>

                <Separator />

                <div className="flex items-center justify-between">
                  <Label htmlFor="collaborationAlerts">Collaboration Alerts</Label>
                  <Switch
                    id="collaborationAlerts"
                    checked={preferences.collaborationAlerts}
                    onCheckedChange={handleSwitchChange('collaborationAlerts')}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Receive notifications when someone joins or edits your shared layouts
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserPreferencesPage; 