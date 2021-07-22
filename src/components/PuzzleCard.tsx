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
  Menu,
  MenuItem,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { toXWordDate } from "../utils/toXWordDate";
import puzzleSVG from "../images/XWordSquare.svg";

interface PuzzleCardProps {
  puzzleDate: Date;
  onClick: (action: PuzzleCardAction) => void;
  hasSession: boolean;
}

export enum PuzzleCardAction {
  NEW_GAME = "new_game",
  CONTINUE_GAME = "continue_game",
  END_GAME = "end_game",
}

export const PuzzleCard: React.FC<PuzzleCardProps> = ({
  puzzleDate,
  onClick,
  hasSession,
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
          borderWidth={hasSession ? 3 : 0}
          borderColor={hasSession ? theme.colors.yellow[500] : undefined}
        >
          <AspectRatio ratio={1}>
            <Image
              draggable={false}
              borderTopRadius="lg"
              w="100%"
              mx="auto"
              src={puzzleSVG}
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
          {hasSession ? (
            <>
              <Button
                variant="ghost"
                w="100%"
                onClick={() => {
                  onClick(PuzzleCardAction.CONTINUE_GAME);
                  setIsPopoverOpen(false);
                }}
              >
                Continue Game
              </Button>
              <Button
                variant="ghost"
                w="100%"
                onClick={() => {
                  onClick(PuzzleCardAction.END_GAME);
                  setIsPopoverOpen(false);
                }}
              >
                End Game
              </Button>
            </>
          ) : (
            <Menu>
              <MenuItem
                variant="ghost"
                w="100%"
                onClick={() => {
                  onClick(PuzzleCardAction.NEW_GAME);
                  setIsPopoverOpen(false);
                }}
                justifyContent="center"
              >
                Start Game
              </MenuItem>
            </Menu>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
