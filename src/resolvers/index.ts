import UsersResolver from "./Users";
import TagsResolver from "./Tags";
import HostelResolver from "./Hostel";
import LostAndFoundResolver from "./LostAndFound";
import AnnouncementResolver from "./Announcement";
import NetopResolver from "./Netop";
import CommentResolver from "./Comment";
import ReportResolver from "./Report";
import QueryResolver from "./Query";

export default [
  UsersResolver,
  TagsResolver,
  HostelResolver,
  AnnouncementResolver,
  NetopResolver,
  CommentResolver,
  ReportResolver,
  LostAndFoundResolver,
  QueryResolver,
] as const;
