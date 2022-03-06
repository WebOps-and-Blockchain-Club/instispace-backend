import bcryptjs from "bcryptjs";

export enum UserRole {
  ADMIN = "ADMIN",
  DEV_TEAM = "DEV_TEAM",
  LEADS = "LEADS",
  MODERATOR = "MODERATOR",
  USER = "USER",
  HOSTEL_SEC = "HOSTEL_SEC",
  SECRETORY = "SECRETORY",
  HAS = "HAS",
}

export enum Category {
  LOST = "LOST",
  FOUND = "FOUND",
}

export enum Notification {
  FORALL = "FORALL",
  FOLLOWED_TAGS = "FOLLOWED_TAGS",
  NONE = "NONE",
}

export enum ComplaintCategory {
  MESS_COMPLAINTS = "MESS_COMPLAINTS",
  GENERAL_COMPLAINTS = "GENERAL_COMPLAINTS",
  HOSTEL_COMPLAINTS = "HOSTEL_COMPLAINTS",
}

export const emailExpresion =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const adminEmail = "myhostel@gmail.com";

export const adminPassword = "123456";

export const accountPassword = "123456";

export const smail = "@smail.iitm.ac.in";

export var salt = bcryptjs.genSaltSync(Number(process.env.ITERATIONS!));

export function autoGenPass(length: number) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

//miliseconds per month = 2629800000
export const miliSecPerMonth = 2629800000;

export const usersDevList = [
  {
    roll: "MM19B035",
    pass: "123456",
  },
  {
    roll: "BS20B039",
    pass: "123456",
  },
  {
    roll: "CH20B010",
    pass: "123456",
  },
  {
    roll: "CH20B013",
    pass: "123456",
  },
  {
    roll: "ED20B014",
    pass: "123456",
  },
  {
    roll: "EE20B114",
    pass: "123456",
  },
  {
    roll: "EE20B129",
    pass: "123456",
  },
];
