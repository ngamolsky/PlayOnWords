import {
  Box,
  theme,
  AspectRatio,
  Skeleton,
  Heading,
  useColorMode,
  Image,
  Text,
  Popover,
  PopoverTrigger,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  Button,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { XWORD_THUMBNAIL_IMAGE } from "../constants";
import { toXWordDate } from "../utils/toXWordDate";

interface PuzzleCardProps {
  puzzleDate: Date;
  puzzleID: string;
  onClick: (puzzleID: string) => void;
}

export const PuzzleCard: React.FC<PuzzleCardProps> = ({
  puzzleDate,
  puzzleID,
  onClick,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <Popover isOpen={isPopoverOpen} onClose={() => setIsPopoverOpen(false)}>
      <PopoverTrigger>
        <Box
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          bgColor={isDark ? theme.colors.gray[700] : theme.colors.gray[400]}
          m="auto"
          w="90%"
          borderRadius="lg"
          cursor="pointer"
          boxShadow="lg"
        >
          <AspectRatio ratio={1}>
            <Image
              draggable={false}
              borderTopRadius="lg"
              w="100%"
              mx="auto"
              src={XWORD_THUMBNAIL_IMAGE}
              alt="Crossword Puzzle Image"
              fallback={<Skeleton />}
              overflow="hidden"
            />
          </AspectRatio>
          <Box m="2">
            <Heading
              size="md"
              fontSize={{ base: "10px", lg: "10px", xl: "14px" }}
            >
              {toXWordDate(puzzleDate)}
            </Heading>
            <Text mt="2" fontSize={{ base: "6px", lg: "10px", xl: "14px" }}>
              New York Times
            </Text>
          </Box>
        </Box>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverBody>
          <Button
            variant="ghost"
            w="100%"
            onClick={() => {
              onClick(puzzleID);
              setIsPopoverOpen(false);
            }}
          >
            Start Game
          </Button>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
