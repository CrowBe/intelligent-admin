import type { Preview } from '@storybook/react-vite'
// Note: CSS import removed due to Tailwind CSS compatibility issues with Storybook build

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    // Accessibility testing configuration
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'keyboard-navigation',
            enabled: true,
          },
        ],
      },
    },
    // Documentation setup
    docs: {
      autodocs: 'tag',
    },
  },
  // Global decorators for consistent styling
  decorators: [
    (Story) => {
      return (
        <div style={{ margin: '3em', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
          <Story />
        </div>
      );
    },
  ],
};

export default preview;