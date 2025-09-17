import { Moon, Sun, Monitor, Check } from 'lucide-react';
import { Button } from './button';
import { useTheme, type Theme } from '@/hooks/useTheme';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './dropdown-menu';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'system':
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Sáng';
      case 'dark':
        return 'Tối';
      case 'system':
        return 'Hệ thống';
    }
  };

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
    {
      value: 'light',
      label: 'Sáng',
      icon: <Sun className="h-4 w-4" />
    },
    {
      value: 'dark',
      label: 'Tối',
      icon: <Moon className="h-4 w-4" />
    },
    {
      value: 'system',
      label: 'Hệ thống',
      icon: <Monitor className="h-4 w-4" />
    }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2"
          title="Thay đổi giao diện"
        >
          {getIcon()}
          <span className="text-sm">{getLabel()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Chọn giao diện</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themeOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setTheme(option.value)}
            className="flex items-center justify-between py-2"
          >
            <div className="flex items-center gap-2">
              {option.icon}
              <span className="font-medium">{option.label}</span>
            </div>
            {theme === option.value && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};