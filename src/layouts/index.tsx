import type { BoxProps, FlexProps } from "@chakra-ui/react";
import { css } from "@emotion/css";
import {
  Avatar,
  Box,
  CloseButton,
  Drawer,
  DrawerContent,
  Flex,
  HStack,
  Icon,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  VStack,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { Link as RouterLink, useRoute } from "wouter";
import {
  FiBell,
  FiChevronDown,
  FiCompass,
  FiHome,
  FiMenu,
  FiSettings,
  FiStar,
  FiTrendingUp,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { primer } from "~/styles/primer";

interface LinkItemProps {
  name: string;
  icon: IconType;
  href: string;
}
const LinkItems: Array<LinkItemProps> = [
  { name: "Home", icon: FiHome, href: "/" },
  { name: "Trending", icon: FiTrendingUp, href: "/" },
  { name: "Explore", icon: FiCompass, href: "/" },
  { name: "Favorites", icon: FiStar, href: "/" },
  { name: "Settings", icon: FiSettings, href: "/" },
];

export default function Layout({
  title,
  titleIcons,
  prefix,
  children,
  sidebarContent,
}: {
  title?: React.ReactNode;
  titleIcons?: React.ReactNode;
  prefix?: React.ReactNode;
  sidebarContent?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box
      className={css`
        background-color: var(--color-canvas-default);
        min-height: 100vh;
      `}
      _dark={{
        backgroundColor: "#121212",
      }}
    >
      <MobileNav onOpen={onOpen} title={title} icons={titleIcons} />
      <SidebarContent onClose={() => onClose} display={{ base: "none", md: "block" }}>
        {sidebarContent}
      </SidebarContent>

      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>

      <Box ml={{ base: 0, md: 60 }} p="4" mt="12">
        {prefix != null && (
          <Box data-name="prefix" ml={{ base: 0, md: 60 }}>
            {prefix}
          </Box>
        )}
        {children}
      </Box>
    </Box>
  );
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

function useActiveProject() {
  return useRoute("/:project/:a*")[1]?.project;
}

function ProjectPicker() {
  const project = useActiveProject();

  return (
    <Menu>
      <MenuButton
        lang="en"
        className={css`
          font-weight: 500;
          text-transform: capitalize;
          &:hover {
            text-decoration: underline;
          }
        `}
      >
        {project}
      </MenuButton>
      <MenuList>
        <MenuItem as={RouterLink} to="/">
          Wikipedia
        </MenuItem>
        <MenuItem as={RouterLink} to="/wiktionary/en">
          Wiktionary
        </MenuItem>
      </MenuList>
    </Menu>
  );
}

function SidebarContent({ onClose, children, ...rest }: SidebarProps) {
  return (
    <Box
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", md: 60 }}
      className={css`
        border-right-width: 1px;
        transition: 3s ease;
        position: fixed;
        height: 100%;
      `}
      {...rest}
    >
      <Flex
        h="20"
        alignItems="center"
        mx="8"
        justifyContent="space-between"
        display={{ base: "flex", md: "none" }}
      >
        <ProjectPicker />
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>
      <Box my={{ base: 0, md: 4 }}>
        {LinkItems.map(link => (
          <NavItem key={link.name} icon={link.icon} href={link.href}>
            {link.name}
          </NavItem>
        ))}
      </Box>
      {children}
    </Box>
  );
}

interface NavItemProps extends FlexProps {
  icon: IconType;
  children: React.ReactNode;
  href: string;
}
const NavItem = ({ icon, children, href, ...rest }: NavItemProps) => (
  <Link
    as={RouterLink}
    to={href}
    className={css`
      text-decoration: none;
      &:focus {
        box-shadow: none;
      }
    `}
  >
    <Flex
      px="4"
      py="2"
      mx="4"
      borderRadius="lg"
      role="group"
      _hover={{
        bg: primer.accent.emphasis,
        color: "white",
      }}
      className={css`
        align-items: center;
        cursor: pointer;
      `}
      {...rest}
    >
      {icon && (
        <Icon
          mr="4"
          _groupHover={{
            color: "white",
          }}
          className={css`
            font-size: 16px;
          `}
          as={icon}
        />
      )}
      {children}
    </Flex>
  </Link>
);

interface MobileProps extends Omit<FlexProps, "title"> {
  title?: React.ReactNode;
  icons?: React.ReactNode;
  onOpen(): void;
}

const MobileNav = ({ onOpen, title, icons, ...rest }: MobileProps) => (
  <Flex
    ml={{ base: 0 }}
    px={{ base: 4, md: 4 }}
    height="12"
    borderBottomColor={useColorModeValue("gray.200", "gray.700")}
    justifyContent={{ base: "space-between", md: "flex-end" }}
    className={css`
      align-items: center;
      background: var(--chakra-colors-chakra-body-bg);
      border-bottom-width: 1px;
      position: fixed;
      top: 0;
      width: 100%;
      z-index: 2;
    `}
    {...rest}
  >
    <IconButton
      display={{ base: "flex", md: "none" }}
      onClick={onOpen}
      variant="outline"
      aria-label="open menu"
      icon={<FiMenu />}
    />

    <Box
      display={{ base: "none", md: "block" }}
      marginLeft={{ md: 4 }}
      marginRight={{ md: 8 }}
    >
      <ProjectPicker />
    </Box>

    {title}

    <HStack spacing={{ base: "0" }}>
      {icons}
      <IconButton size="lg" variant="ghost" aria-label="open menu" icon={<FiBell />} />
      <div
        className={css`
          display: flex;
          align-items: center;
        `}
      >
        <Menu>
          <MenuButton py={2} transition="all 0.3s" _focus={{ boxShadow: "none" }}>
            <HStack>
              <Avatar
                size="sm"
                src={
                  "https://images.unsplash.com/photo-1619946794135-5bc917a27793?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9"
                }
              />
              <VStack
                display={{ base: "none", md: "flex" }}
                alignItems="flex-start"
                spacing="1px"
                ml="2"
              >
                <Text fontSize="sm">Guest</Text>
              </VStack>
              <Box display={{ base: "none", md: "flex" }}>
                <FiChevronDown />
              </Box>
            </HStack>
          </MenuButton>
          <MenuList borderColor={useColorModeValue("gray.200", "gray.700")}>
            <MenuItem>Profile</MenuItem>
            <MenuItem>Settings</MenuItem>
            <MenuItem>Billing</MenuItem>
            <MenuDivider />
            <MenuItem>Sign out</MenuItem>
          </MenuList>
        </Menu>
      </div>
    </HStack>
  </Flex>
);
