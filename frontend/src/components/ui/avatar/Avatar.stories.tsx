import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'UI Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A component for displaying user profile images with automatic fallback support. Used for user profiles, client avatars, team members, and chat participants in the intelligent admin interface.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
        alt="John Smith"
      />
      <AvatarFallback>JS</AvatarFallback>
    </Avatar>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatar with a loaded image. The fallback is automatically hidden when the image loads successfully.',
      },
    },
  },
};

export const FallbackOnly: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatar displaying only the fallback content with user initials.',
      },
    },
  },
};

export const LoadingState: Story = {
  render: () => (
    <Avatar>
      <AvatarImage
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&delay=3000"
        alt="Loading"
      />
      <AvatarFallback>...</AvatarFallback>
    </Avatar>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatar in loading state. Shows fallback while image is loading.',
      },
    },
  },
};

export const BrokenImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://invalid-url.com/broken.jpg" alt="Broken" />
      <AvatarFallback>ER</AvatarFallback>
    </Avatar>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatar with a broken image URL. Automatically displays the fallback when image fails to load.',
      },
    },
  },
};

export const SmallSize: Story = {
  render: () => (
    <Avatar className="size-8">
      <AvatarImage
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
        alt="Small avatar"
      />
      <AvatarFallback>SM</AvatarFallback>
    </Avatar>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Small avatar (32px) - useful for chat messages and compact lists.',
      },
    },
  },
};

export const DefaultSize: Story = {
  render: () => (
    <Avatar>
      <AvatarImage
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
        alt="Default avatar"
      />
      <AvatarFallback>MD</AvatarFallback>
    </Avatar>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Default avatar size (40px) - standard size for most use cases.',
      },
    },
  },
};

export const LargeSize: Story = {
  render: () => (
    <Avatar className="size-16">
      <AvatarImage
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
        alt="Large avatar"
      />
      <AvatarFallback>LG</AvatarFallback>
    </Avatar>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Large avatar (64px) - suitable for profile pages and detailed views.',
      },
    },
  },
};

export const ExtraLargeSize: Story = {
  render: () => (
    <Avatar className="size-24">
      <AvatarImage
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
        alt="Extra large avatar"
      />
      <AvatarFallback>XL</AvatarFallback>
    </Avatar>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Extra large avatar (96px) - ideal for user profile headers.',
      },
    },
  },
};

export const ClientAvatar: Story = {
  render: () => (
    <Avatar>
      <AvatarImage
        src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop"
        alt="ABC Plumbing Services"
      />
      <AvatarFallback className="bg-blue-500 text-white">AP</AvatarFallback>
    </Avatar>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Client avatar for trade business customers with custom colored fallback.',
      },
    },
  },
};

export const TeamMemberAvatar: Story = {
  render: () => (
    <Avatar>
      <AvatarImage
        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
        alt="Site supervisor Michael"
      />
      <AvatarFallback className="bg-green-500 text-white">MS</AvatarFallback>
    </Avatar>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Team member avatar for trade business staff with custom styling.',
      },
    },
  },
};

export const AIAssistantAvatar: Story = {
  render: () => (
    <Avatar className="size-8">
      <AvatarFallback className="bg-purple-600 text-white">AI</AvatarFallback>
    </Avatar>
  ),
  parameters: {
    docs: {
      description: {
        story: 'AI Assistant avatar used in chat interface - small size with distinctive purple color.',
      },
    },
  },
};

export const UserProfileAvatar: Story = {
  render: () => (
    <Avatar className="size-24 border-4 border-primary">
      <AvatarImage
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop"
        alt="Business owner profile"
      />
      <AvatarFallback className="text-2xl">BO</AvatarFallback>
    </Avatar>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Large user profile avatar with border - used on profile and settings pages.',
      },
    },
  },
};

export const WithStatusIndicator: Story = {
  render: () => (
    <div className="relative inline-block">
      <Avatar>
        <AvatarImage
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
          alt="Online user"
        />
        <AvatarFallback>OU</AvatarFallback>
      </Avatar>
      <span className="absolute bottom-0 right-0 block size-3 rounded-full bg-green-500 ring-2 ring-white" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatar with online status indicator - useful for showing user availability.',
      },
    },
  },
};

export const AvatarGroup: Story = {
  render: () => (
    <div className="flex -space-x-2">
      <Avatar className="border-2 border-white">
        <AvatarImage
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
          alt="User 1"
        />
        <AvatarFallback>U1</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-white">
        <AvatarImage
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
          alt="User 2"
        />
        <AvatarFallback>U2</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-white">
        <AvatarImage
          src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop"
          alt="User 3"
        />
        <AvatarFallback>U3</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-white">
        <AvatarFallback className="bg-muted">+5</AvatarFallback>
      </Avatar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Group of overlapping avatars - useful for showing multiple team members or project participants.',
      },
    },
  },
};

export const IconFallback: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-6"
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </AvatarFallback>
    </Avatar>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatar with icon fallback instead of text initials.',
      },
    },
  },
};

export const CustomColors: Story = {
  render: () => (
    <div className="flex gap-4">
      <Avatar>
        <AvatarFallback className="bg-red-500 text-white">R</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback className="bg-orange-500 text-white">O</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback className="bg-yellow-500 text-white">Y</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback className="bg-green-500 text-white">G</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback className="bg-blue-500 text-white">B</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback className="bg-purple-500 text-white">P</AvatarFallback>
      </Avatar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatars with custom background colors - useful for color-coding users or categories.',
      },
    },
  },
};

export const ResponsiveSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar className="size-6">
        <AvatarFallback className="text-xs">XS</AvatarFallback>
      </Avatar>
      <Avatar className="size-8">
        <AvatarFallback className="text-sm">SM</AvatarFallback>
      </Avatar>
      <Avatar className="size-10">
        <AvatarFallback>MD</AvatarFallback>
      </Avatar>
      <Avatar className="size-12">
        <AvatarFallback className="text-lg">LG</AvatarFallback>
      </Avatar>
      <Avatar className="size-16">
        <AvatarFallback className="text-xl">XL</AvatarFallback>
      </Avatar>
      <Avatar className="size-20">
        <AvatarFallback className="text-2xl">2X</AvatarFallback>
      </Avatar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Various avatar sizes demonstrating responsive scaling from extra small to 2XL.',
      },
    },
  },
};

export const MobileView: Story = {
  render: () => (
    <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
      <Avatar className="size-12">
        <AvatarImage
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
          alt="Trade professional"
        />
        <AvatarFallback>TP</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="font-semibold">Trade Professional</div>
        <div className="text-sm text-muted-foreground">Online</div>
      </div>
    </div>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'Avatar in mobile context - optimized for touch interfaces used by trade professionals on-site.',
      },
    },
  },
};
