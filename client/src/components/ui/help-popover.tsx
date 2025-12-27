import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HelpCircle } from "lucide-react";

interface HelpPopoverProps {
  title?: string;
  note?: string;
  helpItems: Array<{
    title: string;
  }>;
  align?: "start" | "center" | "end";
  onNoteClick?: () => void;
}

const HelpPopover = ({
  title,
  note,
  helpItems,
  align = "start",
  onNoteClick,
}: HelpPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-accent transition-colors"
          aria-label="Hiển thị trợ giúp"
        >
          <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 bg-popover border-border shadow-lg"
        align={align}
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-medium text-base text-popover-foreground">
              {title}
            </h4>
            <p
              className={`text-sm text-muted-foreground ${
                onNoteClick ? 'cursor-pointer hover:text-foreground transition-colors' : ''
              }`}
              onClick={onNoteClick}
            >
              {note}
            </p>
          </div>

          <div className="space-y-3 text-sm">
            {helpItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div className="space-y-1">
                  <p className="font-medium text-popover-foreground">
                    {" "}
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export { HelpPopover };
