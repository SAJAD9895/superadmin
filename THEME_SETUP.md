# Theme & Branding Setup

## Overview
This document describes the theme switching functionality and branding setup for the Souq Route Business Admin Panel.

## Theme Configuration

### Default Theme
- **Default Theme**: Light mode
- The application now defaults to a clean, professional light theme
- User preference is saved in localStorage and persists across sessions

### Theme Toggle Button
A theme toggle button has been added to the sidebar with the following features:
- **Location**: Bottom of the sidebar, above the logout button
- **Icons**: 
  - Sun icon (☀️) when in dark mode → Click to switch to light mode
  - Moon icon (🌙) when in light mode → Click to switch to dark mode
- **Label**: Displays "Light Mode" or "Dark Mode" based on current theme
- **Tooltip**: Shows "Switch to light/dark mode" on hover

### Theme-Aware Components
The following components automatically adapt to the selected theme:

1. **Sidebar Logo**
   - Dark mode: Uses white/colored logo (`Souq_Route_white_red.png`)
   - Light mode: Uses black logo (`souq-route-logo-black.png`)

2. **Login Page Logo**
   - Automatically switches based on theme
   - Maintains consistent branding across all pages

3. **All UI Elements**
   - Colors, backgrounds, borders, and shadows adapt automatically
   - Defined in `src/index.css` using CSS custom properties

## Branding Assets

### Logo Files
Located in `/public/images/`:
- `Souq_Route_white_red.png` - White/colored logo for dark backgrounds
- `souq-route-logo-black.png` - Black logo for light backgrounds

### Favicon
- **Location**: `/public/favicon.png`
- **Format**: PNG
- **Usage**: Browser tab icon and Apple touch icon

### Page Title
- **Title**: "Souq Route Admin"
- **Location**: `index.html`

## Technical Implementation

### Theme Context
- **File**: `src/contexts/ThemeContext.jsx`
- **Hook**: `useTheme()`
- **Methods**: 
  - `theme` - Current theme ('light' or 'dark')
  - `toggleTheme()` - Switch between themes

### CSS Variables
All theme colors are defined in `src/index.css` using CSS custom properties:
- Light theme: `[data-theme="light"]`
- Dark theme: Default root styles

### Integration
The ThemeProvider wraps the entire application in `App.jsx`:
```jsx
<ThemeProvider>
  <BrowserRouter>
    <AuthProvider>
      <ErrorProvider>
        {/* App content */}
      </ErrorProvider>
    </AuthProvider>
  </BrowserRouter>
</ThemeProvider>
```

## Usage

### For Users
1. Click the theme toggle button in the sidebar
2. The entire application will switch between light and dark modes
3. Your preference is automatically saved

### For Developers
To use the theme in any component:
```jsx
import { useTheme } from '../contexts/ThemeContext';

const MyComponent = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div>
      Current theme: {theme}
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};
```

## Brand Colors

### Souq Route Brand Palette
- **Primary Red**: `#e21323`
- **White**: `#ffffff`
- **Gray**: `#adadad`
- **Black**: `#000000`

These colors are consistently applied across both themes while maintaining readability and visual hierarchy.
