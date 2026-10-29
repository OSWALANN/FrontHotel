import hotelIcon from "../../Adminpage/icons/hotelicon.png";
import perfil from "../../Adminpage/icons/perfil.jpeg";
import hab1 from "../../Adminpage/icons/hab1.jpg";
import hab2 from "../../Adminpage/icons/hab2.jpg";
import hab3 from "../../Adminpage/icons/hab3.jpg";
import Beach from "../../Adminpage/icons/Beach.jpg";

// Títulos de las páginas
export const pageTitles = {
  "/": "main",
  "/rooms": "rooms",
  "/reservation": "reservation",
  "/guests": "guests",
  "/reports": "reports",
  "/notifications": "notifications",
  "/settings": "settings",
};

// Menú
export const menuGroups = [
  {
    title: "mainGroup",
    items: [
      {
        path: "/",
        label: "home",
        icon: "bx-home",
      },
      {
        path: "/rooms",
        label: "rooms",
        icon: "bx-bed",
      },
      {
        path: "/reservation",
        label: "reservations",
        icon: "bx-calendar",
      },
    ],
  },

  {
    title: "managementGroup",
    items: [
      {
        path: "/guests",
        label: "guests",
        icon: "bx-group",
      },
      {
        path: "/reports",
        label: "reports",
        icon: "bx-news",
      },
      {
        path: "/notifications",
        label: "notifications",
        icon: "bx-bell",
      },
    ],
  },

  {
    title: "systemGroup",
    items: [
      {
        path: "/settings",
        label: "settings",
        icon: "bx-cog",
      },
    ],
  },
];

export const userProfile = {
  hotelIcon,
  avatar: perfil,
  name: "Oswal",
  email: "oswalmarin56@gmail.com",
};

export const rooms = [
  { name: "Room 1", image: hab1 },
  { name: "Room 2", image: hab2 },
  { name: "Room 3", image: hab3 },
  { name: "Room 4", image: hab1 },
  { name: "Room 5", image: hab1 },
  { name: "Room 6", image: hab1 },
  { name: "Room 7", image: hab1 },
  { name: "Room 8", image: hab1 },
  { name: "Room 9", image: hab1 },
  { name: "Room 10", image: hab1 },
];

export const imageMain = [
  {
    name: "BeachMain 1",
    image: Beach,
  },
];

export const roomStatuses = [
  {
    label: "available",
    value: 6,
    className: "disponible",
    symbol: "OK",
  },
  {
    label: "occupied",
    value: 1,
    className: "ocupado",
    symbol: "X",
  },
  {
    label: "reserved",
    value: 2,
    className: "reservado",
    symbol: "R",
  },
  {
    label: "disabled",
    value: 1,
    className: "inhabilitado",
    symbol: "-",
  },
];

export const notifications = [
  {
    id: 1,
    title: "New reservation",
    description:
      "A new reservation has been registered for Room 4.",
    date: "02/09/2026",
    time: "12:05 PM",
    icon: "bx-calendar-check",
    read: false,
  },

  {
    id: 2,
    title: "Room occupied",
    description:
      "Room 2 has changed its status to occupied.",
    date: "02/09/2026",
    time: "10:32 AM",
    icon: "bx-bed",
    read: false,
  },

  {
    id: 3,
    title: "Reservation completed",
    description:
      "The reservation for Room 7 has been completed successfully.",
    date: "01/09/2026",
    time: "08:45 PM",
    icon: "bx-check-circle",
    read: true,
  },

  {
    id: 4,
    title: "Room maintenance",
    description:
      "Room 5 has been marked as unavailable for maintenance.",
    date: "01/09/2026",
    time: "04:20 PM",
    icon: "bx-wrench",
    read: true,
  },
];

export const reservationsData = [
  { month: "Jan", reservations: 32 },
  { month: "Feb", reservations: 45 },
  { month: "Mar", reservations: 52 },
  { month: "Apr", reservations: 48 },
  { month: "May", reservations: 61 },
  { month: "Jun", reservations: 70 },
  { month: "Jul", reservations: 82 },
  { month: "Aug", reservations: 76 },
  { month: "Sep", reservations: 55 },
  { month: "Oct", reservations: 49 },
  { month: "Nov", reservations: 38 },
  { month: "Dec", reservations: 64 },
];

export const investmentData = [
  { month: "Jan", payroll: 85000, maintenance: 18000 },
  { month: "Feb", payroll: 85000, maintenance: 12000 },
  { month: "Mar", payroll: 90000, maintenance: 22000 },
  { month: "Apr", payroll: 90000, maintenance: 15000 },
  { month: "May", payroll: 92000, maintenance: 25000 },
  { month: "Jun", payroll: 95000, maintenance: 30000 },
  { month: "Jul", payroll: 98000, maintenance: 35000 },
  { month: "Aug", payroll: 98000, maintenance: 28000 },
  { month: "Sep", payroll: 95000, maintenance: 18000 },
  { month: "Oct", payroll: 92000, maintenance: 15000 },
  { month: "Nov", payroll: 90000, maintenance: 12000 },
  { month: "Dec", payroll: 95000, maintenance: 25000 },
];

export const seasonData = [
  { month: "Jan", occupancy: 45 },
  { month: "Feb", occupancy: 48 },
  { month: "Mar", occupancy: 52 },
  { month: "Apr", occupancy: 58 },
  { month: "May", occupancy: 62 },
  { month: "Jun", occupancy: 72 },
  { month: "Jul", occupancy: 88 },
  { month: "Aug", occupancy: 84 },
  { month: "Sep", occupancy: 60 },
  { month: "Oct", occupancy: 55 },
  { month: "Nov", occupancy: 48 },
  { month: "Dec", occupancy: 75 },
];

export const profitsData = [
  { name: "Room revenue", value: 620000 },
  { name: "Services", value: 145000 },
  { name: "Other income", value: 65000 },
];