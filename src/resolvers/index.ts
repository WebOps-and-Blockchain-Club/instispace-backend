import UsersResolver from "./Users";
import TagsResolver from "./Tags";
import HostelResolver from "./Hostel";
import AnnouncementResolver from "./Announcement";
import NetopResolver from "./Netop";

export default [
  UsersResolver,
  TagsResolver,
  HostelResolver,
  AnnouncementResolver,
  NetopResolver,
] as const;
