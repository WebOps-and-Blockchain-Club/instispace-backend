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

export enum UserPermission {
  CREATE_ITEM = "CREATE_ITEM",
  CREATE_QUERY = "CREATE_QUERY",
  CREATE_EVENT = "CREATE_EVENT",
  CREATE_NETOP = "CREATE_NETOP",
  CREATE_CONTACT = "CREATE_CONTACT",
  CREATE_AMENITY = "CREATE_AMENITY",
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

export const emailExpresion =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const adminEmail = "myhostel@gmail.com";

export const adminPassword = "123456";

export const accountPassword = "123456";

export const smail = "@smail.iitm.ac.in";

export const sheetLink =
  "https://docs.google.com/spreadsheets/d/1ECJ1V1KoJB7W3jNyrOD_F-46tKl_ZNPGRPNqMqZkNsA/edit?usp=sharing";

export const messMenu =
  "https://drive.google.com/drive/folders/1woTIJzE_AT5mJZgGCVJ_qiCGv03JlZqk?usp=sharing";
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
    roll: "CH20B014",
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

export const getDepartment = (code: string) => {
  let deptCode = code.toUpperCase();
  switch (deptCode) {
    case "AE":
      return "Aerospace Engineering";
    case "AM":
      return "Applied Mechanics";
    case "BE" || "BS" || "BT":
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
    case "OE" || "NA":
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
