import * as bcryptjs from 'bcryptjs';


export enum UserRole {
  ADMIN = "ADMIN",
  DEV_TEAM = "DEV_TEAM",
  LEADS = "LEADS",
  MODERATOR = "MODERATOR",
  USER = "USER",
  HOSTEL_SEC = "HOSTEL_SEC",
  SECRETARY = "SECRETARY",
  HAS = "HAS",
}

export enum UserPermission {
  CREATE_ITEM = "CREATE_ITEM",
  CREATE_QUERY = "CREATE_QUERY",
  CREATE_EVENT = "CREATE_EVENT",
  CREATE_NETOP = "CREATE_NETOP",
  CREATE_CONTACT = "CREATE_CONTACT",
  CREATE_AMENITY = "CREATE_AMENITY",
  CREATE_REPORT_REASON = "CREATE_REPORT_REASON",
  CREATE_ANNOUNCEMENT = "CREATE_ANNOUNCEMENT",
  CREATE_HOSTEL = "CREATE_HOSTEL",
  CREATE_FEEDBACK = "CREATE_FEEDBACK",
  CREATE_ACCOUNT = "CREATE_ACCOUNT",
  CREATE_TAG = "CREATE_TAG",
  GET_REPORTS = "GET_REPORTS",
  GET_AMENITIES = "GET_AMENITIES",
  GET_ALL_AMENITIES = "GET_ALL_AMENITIES",
  GET_CONTACTS = "GET_CONTACTS",
  GET_ALL_CONTACTS = "GET_ALL_CONTACTS",
  GET_ANNOUNCEMENTS = "GET_ANNOUNCEMENTS",
  GET_ALL_ANNOUNCEMENTS = "GET_ALL_ANNOUNCEMENTS",
  VIEW_FEEDBACK = "VIEW_FEEDBACK",
  UPDATE_ROLE = "UPDATE_ROLE",
  HOSTEL_ADMIN = "HOSTEL_ADMIN",
  CREATE_NOTIFICATION = "CREATE_NOTIFICATION",
  VIEW_SUPER_USER_LIST = "VIEW_SUPER_USER_LIST",
  TREASURE_HUNT = "TREASURE_HUNT",
}

export enum EditDelPermission {
  EDIT = "EDIT",
  DELETE = "DELETE",
  COMMENT = "COMMENT",
  REPORT = "REPORT",
  RESOLVE = "RESOLVE",
  RESOLVE_ITEM = "RESOLVE_ITEM",
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

export enum ReportStatus {
  REPORTED = "REPORTED",
  REPORT_ACCEPTED = "REPORT_ACCEPTED",
  REPORT_REJECTED = "REPORT_REJECTED",
}

export enum PostStatus {
  POSTED = "POSTED",
  REPORTED = "REPORTED",
  IN_REVIEW = "IN_REVIEW",
  REPORT_ACCEPTED = "REPORT_ACCEPTED",
  REPORT_REJECTED = "REPORT_REJECTED",
}

export const emailExpresion =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

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

export function shuffle(array: any) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export const getDepartment = (code: string) => {
  let deptCode = code.toUpperCase();
  switch (deptCode) {
    case "AE":
      return "Aerospace Engineering";
    case "AM":
      return "Applied Mechanics";
    case "BE":
      return "Biotechnology";
    case "BS":
      return "Biotechnology";
    case "BT":
      return "Biotechnology";
    case "CH":
      return "Chemical Engineering";
    case "CY":
      return "Chemistry";
    case "CE":
      return "Civil Engineering";
    case "CS":
      return "Computer Science and Engineering";
    case "EE":
      return "Electrical Engineering";
    case "ED":
      return "Engineering Design";
    case "EP":
      return "Physics";
    case "HS":
      return "Humanities and Social Sciences";
    case "MS":
      return "Management Studies";
    case "MA":
      return "Mathematics";
    case "ME":
      return "Mechanical Engineering";
    case "MM":
      return "Metallurgical and Materials Engineering";
    case "OE":
      return "Ocean Engineering";
    case "NA":
      return "Ocean Engineering";
    case "PH":
      return "Physics";
    default:
      return "Null";
  }
};

export const getprogramme = (s: string) => {
  let roll_number = s.toUpperCase();
  let prog = roll_number[4];
  let branch = roll_number.slice(0, 2);

  switch (prog) {
    case "B":
      if (
        branch == "ED" ||
        branch == "BS" ||
        branch == "BE" ||
        branch == "PH"
      ) {
        return "Dual Degree";
      } else {
        return "B.Tech";
      }
    case "D":
      return "Ph.D";

    case "C":
      return "MSc";

    case "S":
      return "MS";

    case "W":
      return "EMBA";

    case "A":
      return "MBA";

    case "M":
      return "M.Tech";

    case "F":
      return "FN";

    case "Z":
      return "ES";

    case "V":
      return "VLM";

    case "H":
      return "MA";
    default:
      return "Null";
  }
};

