declare global {
  interface MenuItem {
    name: string;
    description?: string;
    price: number;
    category: Category;
    availability: Availability;
    diet: Diet;
    tags: Tag[];
  }

  type Category =
    | "appetizers"
    | "beverages"
    | "biryani"
    | "breads"
    | "chaats"
    | "curries"
    | "deli-items"
    | "dosas"
    | "pulav's"
    | "sides"
    | "specials"
    | "tandoori"
    | "tiffins";

  type Availability = "available" | "sold-out" | "coming-soon" | "unavailable";

  type Diet = "vegetarian" | "non-vegetarian";

  type Tag = "popular" | "new" | "family-pack";

  interface Device {
    name: string;
    deviceId: string;
    orientation: "portrait" | "landscape";
    invert: boolean;
    categories: Category[];
  }

  interface SheetData {
    devices: Device[];
    menuItems: MenuItem[];
  }

  interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  type State = "loading" | "success" | "error";
}

export {};
