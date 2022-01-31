import UsersResolver from "./Users";
import TagsResolver from "./Tags";
import HostelResolver from "./Hostel";
import LostAndFoundResolver from "./LostAndFound";
import AnnouncementResolver from "./Announcement";
import NetopResolver from "./Netop";
import CommentResolver from "./Comment";
import ReportResolver from "./Report";
import QueryResolver from "./Query";
import ComplaintResolver from "./Complaint";

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
  ComplaintResolver,
] as const;
