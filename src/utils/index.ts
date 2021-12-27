import bcryptjs from "bcryptjs";

export enum UserRole {
  ADMIN = "ADMIN", 
  DEV_TEAM = "DEV_TEAM",
  LEADS = "LEADS",
  MODERATOR = "MODERATOR",
  USER = "USER",
  HOSTEL_SEC = "HOSTEL_SEC",
  HAS = "HAS",
}

export const emailExpresion =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const adminEmail = "myhostel@gmail.com";

export const adminPassword = "123456";

export const accountPassword =  "123456";

export var salt = bcryptjs.genSaltSync(Number(process.env.ITERATIONS!));

export const usersDevList = [
  {
    roll: "MM19B001",
    pass: "123456",
  },
  {
    roll: "MM19B002",
    pass: "123456",
  },
  {
    roll: "MM19B003",
    pass: "123456",
  },
  {
    roll: "MM19B004",
    pass: "123456",
  },
  {
    roll: "MM19B005",
    pass: "123456",
  },
  {
    roll: "MM19B006",
    pass: "123456",
  },
  {
    roll: "MM19B007",
    pass: "123456",
  },
];
